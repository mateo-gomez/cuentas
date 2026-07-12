import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError";
import { CategoryRepository } from "../../../category/domain/category.repository";
import { DEFAULT_CATEGORY_NAME } from "../../../category/application/CategorySeeder";
import { PreviewStore } from "../../domain/pdfImport/PreviewStore";
import { ConfirmResult, ConfirmRow } from "../dto/pdfImportDTO";
import { TransactionDTO } from "../dto/transactionDTO";
import { TransactionImporter } from "./TransactionImporter";

export class PdfImportConfirmer {
	constructor(
		private readonly previewStore: PreviewStore,
		private readonly categoryRepository: CategoryRepository,
		private readonly transactionImporter: TransactionImporter,
	) {}

	execute = async (
		importSessionId: string,
		rows: ConfirmRow[],
	): Promise<ConfirmResult> => {
		const previewPeek = this.previewStore.get(importSessionId);

		if (!previewPeek) {
			throw new ValidationError({
				importSessionId: [
					"La sesión de importación no existe, expiró o ya fue confirmada",
				],
			});
		}

		this.assertRowsBelongToPreview(rows, previewPeek.rows.map((row) => row.rowId));
		this.assertRowsAreValid(rows);

		const preview = this.previewStore.take(importSessionId);

		if (!preview) {
			throw new ValidationError({
				importSessionId: [
					"La sesión de importación no existe, expiró o ya fue confirmada",
				],
			});
		}

		const previewRowsById = new Map(
			preview.rows.map((row) => [row.rowId, row]),
		);

		const included = rows.filter((row) => !row.excluded);

		const dtos: TransactionDTO[] = [];
		for (const row of included) {
			const category = await this.resolveCategory(row.categoryName);
			const previewRow = previewRowsById.get(row.rowId);

			if (!previewRow) {
				throw new ValidationError({
					rowId: [`La fila ${row.rowId} no pertenece a esta sesión`],
				});
			}

			dtos.push({
				date: new Date(previewRow.date),
				description: row.description,
				value: Math.abs(previewRow.value),
				category: category,
				type: previewRow.type,
			});
		}

		await this.transactionImporter.execute(dtos);

		return { persisted: dtos.length, excluded: rows.length - included.length };
	};

	private resolveCategory = async (categoryName: string): Promise<string> => {
		// Empty category (parser doesn't classify) falls back to the default.
		// get-or-create keeps this resilient to a deleted default category.
		const name = categoryName?.trim() || DEFAULT_CATEGORY_NAME;

		let category = await this.categoryRepository.getByName(name);

		if (!category) {
			category = await this.categoryRepository.createCategory(name, "");
		}

		return category._id;
	};

	private assertRowsBelongToPreview = (
		rows: ConfirmRow[],
		previewRowIds: string[],
	): void => {
		const knownIds = new Set(previewRowIds);
		const unknownRow = rows.find((row) => !knownIds.has(row.rowId));

		if (unknownRow) {
			throw new ValidationError({
				rowId: [`La fila ${unknownRow.rowId} no pertenece a esta sesión`],
			});
		}
	};

	private assertRowsAreValid = (rows: ConfirmRow[]): void => {
		const errors: string[] = [];

		rows.forEach((row) => {
			if (!row.date || isNaN(new Date(row.date).getTime())) {
				errors.push(`fecha inválida en la fila ${row.rowId}`);
			}

			if (!row.description || typeof row.description !== "string") {
				errors.push(`descripción inválida en la fila ${row.rowId}`);
			}

			if (typeof row.value !== "number" || !Number.isFinite(row.value)) {
				errors.push(`valor inválido en la fila ${row.rowId}`);
			}

			if (
				row.type !== TransactionType.income &&
				row.type !== TransactionType.expenses
			) {
				errors.push(`tipo inválido en la fila ${row.rowId}`);
			}

			const sign = Math.sign(row.value);
			const isIncome = row.type === TransactionType.income;

			if (sign !== 0 && ((isIncome && sign < 0) || (!isIncome && sign > 0))) {
				errors.push(
					`el tipo no coincide con el signo del valor en la fila ${row.rowId}`,
				);
			}

			// categoryName may be empty — resolveCategory falls back to the
			// default category. Only a non-string is a real contract violation.
			if (typeof row.categoryName !== "string") {
				errors.push(`categoría inválida en la fila ${row.rowId}`);
			}
		});

		if (errors.length > 0) {
			throw new ValidationError({ rows: errors });
		}
	};
}
