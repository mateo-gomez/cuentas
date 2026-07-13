import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError";
import { CategoryRepository } from "../../../category/domain/category.repository";
import { TransactionDTO } from "../../application/dto/transactionDTO";
import { CategoryClassifier } from "../../application/services/categoryClassifier";
import { ExcelStreamParser } from "../../application/services/excelStreamParser";
import * as XLSX from "xlsx";

export class ExcelTransactionParser implements ExcelStreamParser {
	constructor(
		private readonly categoryClasifier: CategoryClassifier,
		private readonly categoryRepository: CategoryRepository
	) {}

	private REQUIRED_COLUMNS = ["fecha", "descripcion", "categoria", "valor"];

	stringToDate(date: string): Date {
		const [day, month, year] = date.split("/");
		return new Date(`${year}-${month}-${day}`);
	}

	validateHeaders = (headers: string[]) => {
		const missing = this.REQUIRED_COLUMNS.filter(
			(col) => !headers.includes(col)
		);
		if (missing.length > 0) {
			throw new ValidationError({
				file: [`Las columnas ${missing.join(", ")} son obligatorias`],
			});
		}
	};

	validateTransactionRow = async (
		row: any,
		userId: string,
		accountId: string
	): Promise<TransactionDTO> => {
		const errors: string[] = [];

		const date = this.stringToDate(row.at(0));
		if (isNaN(date.getTime())) errors.push("fecha inválida");

		const amount = Number(row.at(3).replaceAll(",", ""));
		if (isNaN(amount)) errors.push("valor inválido");

		let categoryName = row.at(2);
		const description = row.at(1);

		if (!description || typeof description !== "string")
			errors.push("descripción inválida");

		if (errors.length > 0) {
			throw new ValidationError({ file: errors });
		}

		// 🔥 Inferencia de categoría si está vacía
		if (!categoryName) {
			categoryName = this.categoryClasifier.localClassify(description);
		}

		if (!categoryName || typeof categoryName !== "string")
			errors.push("categoria inválida");

		// 🔎 Validar si categoría existe en DB
		let category = await this.categoryRepository.getByNameForUser(userId, categoryName);
		if (!category) {
			category = await this.categoryRepository.createCategory(userId, categoryName, "");
		}

		const type =
			row["valor"] > 0 ? TransactionType.income : TransactionType.expenses;

		return {
			date,
			value: amount,
			category: category._id,
			type,
			description,
			userId,
			accountId,
		};
	};

	parse = async (
		filePath: string,
		onBatch: (batch: TransactionDTO[]) => Promise<void>,
		userId: string,
		accountId: string,
		batchSize = 100
	): Promise<void> => {
		const workbook = XLSX.readFile(filePath);
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];

		const stream = XLSX.stream.to_json(worksheet, {
			raw: false,
			rawNumbers: false,
			header: 1,
			defval: "",
		});

		let batch: TransactionDTO[] = [];
		let isFirstRow = true;

		try {
			for await (const row of stream) {
				if (isFirstRow) {
					const headers = row.map((h: string) => h.trim().toLowerCase());
					this.validateHeaders(headers);
					isFirstRow = false;
					continue;
				}
				const tx = await this.validateTransactionRow(row, userId, accountId);
				batch.push(tx);

				if (batch.length >= batchSize) {
					await onBatch(batch);
					batch = [];
				}
			}

			if (batch.length > 0) {
				await onBatch(batch);
			}
		} catch (err) {
			throw err;
		}
	};
}
