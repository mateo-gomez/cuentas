import { assertParseResponse } from "../../../../src/features/transaction/infrastructure/services/HttpPdfBankParser";
import { InternalError } from "../../../../src/infrastructure/api/errors/internalError";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";

describe("assertParseResponse", () => {
	test("accepts a valid parse response and maps type to the domain enum", () => {
		const parsed = assertParseResponse({
			bankId: "bancolombia",
			transactions: [
				{
					date: "2026-01-10",
					description: "Compra",
					value: -1000,
					type: "expenses",
				},
				{
					date: "2026-01-11",
					description: "Pago",
					value: 5000,
					type: "income",
				},
			],
			warnings: [],
		});

		expect(parsed.bankId).toBe("bancolombia");
		expect(parsed.rows[0].type).toBe(TransactionType.expenses);
		expect(parsed.rows[1].type).toBe(TransactionType.income);
	});

	test("maps a present reconciliation object", () => {
		const parsed = assertParseResponse({
			bankId: "bancolombia",
			transactions: [],
			warnings: [],
			reconciliation: {
				available: true,
				reconciled: false,
				openingBalance: 100,
				closingBalance: 90,
				computedDelta: -5,
				expectedDelta: -10,
				difference: 5,
			},
		});

		expect(parsed.reconciliation).toEqual({
			available: true,
			reconciled: false,
			openingBalance: 100,
			closingBalance: 90,
			computedDelta: -5,
			expectedDelta: -10,
			difference: 5,
		});
	});

	test("defaults reconciliation to unavailable when absent from the payload", () => {
		const parsed = assertParseResponse({
			bankId: "bancolombia",
			transactions: [],
			warnings: [],
		});

		expect(parsed.reconciliation).toEqual({
			available: false,
			reconciled: false,
			openingBalance: null,
			closingBalance: null,
			computedDelta: null,
			expectedDelta: null,
			difference: null,
		});
	});

	test("rejects a missing bankId", () => {
		expect(() =>
			assertParseResponse({ transactions: [] }),
		).toThrow(InternalError);
	});

	test("rejects a non-array transactions field", () => {
		expect(() =>
			assertParseResponse({ bankId: "bancolombia", transactions: "nope" }),
		).toThrow(InternalError);
	});

	test("rejects a row with a non-finite value", () => {
		expect(() =>
			assertParseResponse({
				bankId: "bancolombia",
				transactions: [
					{ date: "2026-01-10", description: "x", value: NaN, type: "income" },
				],
			}),
		).toThrow(InternalError);
	});

	test("rejects a row with an invalid type enum", () => {
		expect(() =>
			assertParseResponse({
				bankId: "bancolombia",
				transactions: [
					{ date: "2026-01-10", description: "x", value: 100, type: "credit" },
				],
			}),
		).toThrow(InternalError);
	});

	test("backfills an empty description instead of rejecting the batch", () => {
		const result = assertParseResponse({
			bankId: "bancolombia",
			transactions: [
				{ date: "2026-01-10", description: "  ", value: 100, type: "income" },
			],
		});

		expect(result.rows[0].description).toBe("Sin descripción");
	});

	test("rejects a row with a non-string description", () => {
		expect(() =>
			assertParseResponse({
				bankId: "bancolombia",
				transactions: [
					{ date: "2026-01-10", description: 42, value: 100, type: "income" },
				],
			}),
		).toThrow(InternalError);
	});
});
