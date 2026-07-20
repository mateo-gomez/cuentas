import { PdfImportConfirmer } from "../../../../src/features/transaction/application/useCases/PdfImportConfirmer";
import { TransactionImporter } from "../../../../src/features/transaction/application/useCases/TransactionImporter";
import { InMemoryPreviewStore } from "../../../../src/features/transaction/infrastructure/services/InMemoryPreviewStore";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { inMemoryCategoryRepository } from "../../../../src/features/category/infrastructure/database/inMemoryCategory.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { PreviewRow } from "../../../../src/features/transaction/application/dto/pdfImportDTO";
import { ValidationError } from "../../../../src/infrastructure/api/errors/validationError";
import { CreateTransfer } from "../../../../src/features/transaction/application/useCases/CreateTransfer";

const ACCOUNT_ID = "account-1";

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
	const createTransfer = new CreateTransfer(transactionRepository);
	const confirmer = new PdfImportConfirmer(
		previewStore,
		categoryRepository,
		transactionImporter,
		createTransfer,
	);

	return { confirmer, previewStore, categoryRepository, transactionRepository, transactionImporter };
};

describe("PdfImportConfirmer", () => {
	test("rejects when the session does not exist", async () => {
		const { confirmer } = buildConfirmer();

		await expect(confirmer.execute("missing-session", [], "user-1",
			ACCOUNT_ID,
		)).rejects.toThrow(
			ValidationError,
		);
	});

	test("rejects a row whose rowId does not belong to the held preview", async () => {
		const { confirmer, previewStore } = buildConfirmer();
		const importSessionId = previewStore.put([previewRow], "bancolombia", []);

		await expect(
			confirmer.execute(importSessionId, [
				{ ...previewRow, rowId: "unknown-row", categoryName: "food" },
			], "user-1",
			ACCOUNT_ID,
		),
		).rejects.toThrow(ValidationError);
	});

	test("creates the category at confirm time when it does not already exist", async () => {
		const { confirmer, previewStore, categoryRepository } = buildConfirmer();
		const importSessionId = previewStore.put([previewRow], "bancolombia", []);

		expect(await categoryRepository.getByNameForUser("user-1", "food")).toBeNull();

		await confirmer.execute(importSessionId, [
			{ ...previewRow, categoryName: "food" },
		], "user-1",
			ACCOUNT_ID,
		);

		expect(await categoryRepository.getByNameForUser("user-1", "food")).not.toBeNull();
	});

	test("clears the session after a successful confirm (single-use)", async () => {
		const { confirmer, previewStore } = buildConfirmer();
		const importSessionId = previewStore.put([previewRow], "bancolombia", []);

		await confirmer.execute(importSessionId, [
			{ ...previewRow, categoryName: "food" },
		], "user-1",
			ACCOUNT_ID,
		);

		expect(previewStore.get(importSessionId)).toBeNull();
		await expect(
			confirmer.execute(importSessionId, [{ ...previewRow, categoryName: "food" }], "user-1",
			ACCOUNT_ID,
		),
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
		], "user-1",
			ACCOUNT_ID,
		);

		expect(result).toEqual({ persisted: 1, excluded: 1 });
		expect(saveManySpy).toHaveBeenCalledTimes(1);
		expect(saveManySpy.mock.calls[0][0]).toHaveLength(1);
		expect(saveManySpy.mock.calls[0][0][0]).toMatchObject({
			userId: "user-1",
			accountId: ACCOUNT_ID,
		});
	});

	test("rejects a concurrent second confirm of the same session and persists only once", async () => {
		const { confirmer, previewStore, transactionRepository } = buildConfirmer();
		const importSessionId = previewStore.put([previewRow], "bancolombia", []);
		const saveManySpy = jest.spyOn(transactionRepository, "saveMany");

		const confirmRows = [{ ...previewRow, categoryName: "food" }];

		const [firstResult, secondResult] = await Promise.allSettled([
			confirmer.execute(importSessionId, confirmRows, "user-1",
			ACCOUNT_ID,
		),
			confirmer.execute(importSessionId, confirmRows, "user-1",
			ACCOUNT_ID,
		),
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
		], "user-1",
			ACCOUNT_ID,
		);

		const persisted = saveManySpy.mock.calls[0][0][0];

		expect(persisted.value).toBe(Math.abs(previewRow.value));
		expect(persisted.type).toBe(previewRow.type);
		expect(persisted.date).toEqual(new Date(previewRow.date));
	});

	test("persists a transfer row as a linked pair instead of a plain expense", async () => {
		const { confirmer, previewStore, transactionRepository } = buildConfirmer();
		const paymentRow: PreviewRow = {
			...previewRow,
			rowId: "pay-1",
			description: "PAGO TARJETA DE CREDITO",
			value: -300000,
			type: TransactionType.expenses,
			suggestedTransfer: true,
		};
		const importSessionId = previewStore.put([paymentRow], "bancolombia", []);

		const result = await confirmer.execute(
			importSessionId,
			[
				{
					...paymentRow,
					categoryName: "",
					isTransfer: true,
					transferToAccountId: "card-1",
				},
			],
			"user-1",
			ACCOUNT_ID,
		);

		expect(result).toEqual({ persisted: 1, excluded: 0 });

		// Two linked legs written: expense on the bank, income on the card.
		const legs = await transactionRepository.getAll("user-1");
		expect(legs).toHaveLength(2);
		expect(legs.every((leg) => leg.isTransfer === true)).toBe(true);
		expect(legs.some((leg) => leg.accountId === ACCOUNT_ID)).toBe(true);
		expect(legs.some((leg) => leg.accountId === "card-1")).toBe(true);
	});

	test("rejects a transfer row missing its destination account", async () => {
		const { confirmer, previewStore } = buildConfirmer();
		const paymentRow: PreviewRow = {
			...previewRow,
			rowId: "pay-2",
			description: "PAGO TARJETA",
			value: -300000,
			type: TransactionType.expenses,
			suggestedTransfer: true,
		};
		const importSessionId = previewStore.put([paymentRow], "bancolombia", []);

		await expect(
			confirmer.execute(
				importSessionId,
				[{ ...paymentRow, categoryName: "", isTransfer: true }],
				"user-1",
				ACCOUNT_ID,
			),
		).rejects.toThrow(ValidationError);
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
			], "user-1",
			ACCOUNT_ID,
		),
		).rejects.toThrow(ValidationError);
	});
});
