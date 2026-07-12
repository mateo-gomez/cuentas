import { PdfImportConfirmer } from "../../../../src/features/transaction/application/useCases/PdfImportConfirmer";
import { TransactionImporter } from "../../../../src/features/transaction/application/useCases/TransactionImporter";
import { InMemoryPreviewStore } from "../../../../src/features/transaction/infrastructure/services/InMemoryPreviewStore";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { inMemoryCategoryRepository } from "../../../../src/features/category/infrastructure/database/inMemoryCategory.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { PreviewRow } from "../../../../src/features/transaction/application/dto/pdfImportDTO";
import { ValidationError } from "../../../../src/infrastructure/api/errors/validationError";

const previewRow: PreviewRow = {
	rowId: "row-1",
	date: "2026-01-10",
	description: "Compra café",
	value: -12000,
	type: TransactionType.expenses,
	categoryName: "food",
	possibleDuplicate: false,
};

const buildConfirmer = () => {
	const previewStore = new InMemoryPreviewStore(1000, false);
	const categoryRepository = new inMemoryCategoryRepository();
	const transactionRepository = new InMemoryTransactionRepository();
	const transactionImporter = new TransactionImporter(transactionRepository);
	const confirmer = new PdfImportConfirmer(
		previewStore,
		categoryRepository,
		transactionImporter,
	);

	return { confirmer, previewStore, categoryRepository, transactionRepository, transactionImporter };
};

describe("PdfImportConfirmer", () => {
	test("rejects when the session does not exist", async () => {
		const { confirmer } = buildConfirmer();

		await expect(confirmer.execute("missing-session", [])).rejects.toThrow(
			ValidationError,
		);
	});

	test("rejects a row whose rowId does not belong to the held preview", async () => {
		const { confirmer, previewStore } = buildConfirmer();
		const importSessionId = previewStore.put([previewRow], "bancolombia", []);

		await expect(
			confirmer.execute(importSessionId, [
				{ ...previewRow, rowId: "unknown-row", categoryName: "food" },
			]),
		).rejects.toThrow(ValidationError);
	});

	test("creates the category at confirm time when it does not already exist", async () => {
		const { confirmer, previewStore, categoryRepository } = buildConfirmer();
		const importSessionId = previewStore.put([previewRow], "bancolombia", []);

		expect(await categoryRepository.getByName("food")).toBeNull();

		await confirmer.execute(importSessionId, [
			{ ...previewRow, categoryName: "food" },
		]);

		expect(await categoryRepository.getByName("food")).not.toBeNull();
	});

	test("clears the session after a successful confirm (single-use)", async () => {
		const { confirmer, previewStore } = buildConfirmer();
		const importSessionId = previewStore.put([previewRow], "bancolombia", []);

		await confirmer.execute(importSessionId, [
			{ ...previewRow, categoryName: "food" },
		]);

		expect(previewStore.get(importSessionId)).toBeNull();
		await expect(
			confirmer.execute(importSessionId, [{ ...previewRow, categoryName: "food" }]),
		).rejects.toThrow(ValidationError);
	});

	test("persists the reviewed batch via TransactionImporter, dropping excluded rows", async () => {
		const { confirmer, previewStore, transactionRepository } = buildConfirmer();
		const secondRow: PreviewRow = {
			...previewRow,
			rowId: "row-2",
			description: "Row 2",
			value: 5000,
			type: TransactionType.income,
		};
		const importSessionId = previewStore.put(
			[previewRow, secondRow],
			"bancolombia",
			[],
		);
		const saveManySpy = jest.spyOn(transactionRepository, "saveMany");

		const result = await confirmer.execute(importSessionId, [
			{ ...previewRow, categoryName: "food" },
			{ ...secondRow, categoryName: "food", excluded: true },
		]);

		expect(result).toEqual({ persisted: 1, excluded: 1 });
		expect(saveManySpy).toHaveBeenCalledTimes(1);
		expect(saveManySpy.mock.calls[0][0]).toHaveLength(1);
	});

	test("rejects a concurrent second confirm of the same session and persists only once", async () => {
		const { confirmer, previewStore, transactionRepository } = buildConfirmer();
		const importSessionId = previewStore.put([previewRow], "bancolombia", []);
		const saveManySpy = jest.spyOn(transactionRepository, "saveMany");

		const confirmRows = [{ ...previewRow, categoryName: "food" }];

		const [firstResult, secondResult] = await Promise.allSettled([
			confirmer.execute(importSessionId, confirmRows),
			confirmer.execute(importSessionId, confirmRows),
		]);

		const fulfilled = [firstResult, secondResult].filter(
			(result) => result.status === "fulfilled",
		);
		const rejected = [firstResult, secondResult].filter(
			(result) => result.status === "rejected",
		);

		expect(fulfilled).toHaveLength(1);
		expect(rejected).toHaveLength(1);
		expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(
			ValidationError,
		);
		expect(saveManySpy).toHaveBeenCalledTimes(1);
		expect(saveManySpy.mock.calls[0][0]).toHaveLength(1);
	});

	test("ignores client-supplied date/value/type and persists the server-side preview values", async () => {
		const { confirmer, previewStore, transactionRepository } = buildConfirmer();
		const importSessionId = previewStore.put([previewRow], "bancolombia", []);
		const saveManySpy = jest.spyOn(transactionRepository, "saveMany");

		await confirmer.execute(importSessionId, [
			{
				...previewRow,
				categoryName: "food",
				date: "2099-12-31",
				value: 999999,
				type: TransactionType.income,
			},
		]);

		const persisted = saveManySpy.mock.calls[0][0][0];

		expect(persisted.value).toBe(Math.abs(previewRow.value));
		expect(persisted.type).toBe(previewRow.type);
		expect(persisted.date).toEqual(new Date(previewRow.date));
	});

	test("rejects the whole batch when type is inconsistent with the sign of value", async () => {
		const { confirmer, previewStore } = buildConfirmer();
		const importSessionId = previewStore.put([previewRow], "bancolombia", []);

		await expect(
			confirmer.execute(importSessionId, [
				{
					...previewRow,
					categoryName: "food",
					value: -1000,
					type: TransactionType.income,
				},
			]),
		).rejects.toThrow(ValidationError);
	});
});
