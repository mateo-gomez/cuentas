import {
	dayKeyFromDate,
	dayKeyFromISODate,
	naturalKey,
	signedValueFromStored,
} from "../../../../src/features/transaction/application/services/naturalKey";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";

describe("naturalKey", () => {
	test("signedValueFromStored negates magnitude for expenses and keeps income positive", () => {
		expect(signedValueFromStored(100, TransactionType.expenses)).toBe(-100);
		expect(signedValueFromStored(100, TransactionType.income)).toBe(100);
	});

	test("naturalKey normalizes description case and surrounding whitespace", () => {
		const a = naturalKey(dayKeyFromISODate("2026-01-01"), -100, "  Coffee Shop  ");
		const b = naturalKey(dayKeyFromISODate("2026-01-01"), -100, "coffee shop");

		expect(a).toBe(b);
	});

	test("naturalKey does NOT collapse whitespace inside the description (no fuzzy matching)", () => {
		const a = naturalKey(dayKeyFromISODate("2026-01-01"), -100, "coffee  shop");
		const b = naturalKey(dayKeyFromISODate("2026-01-01"), -100, "coffee shop");

		expect(a).not.toBe(b);
	});

	test("naturalKey differs across calendar days, even a second apart across midnight", () => {
		const beforeMidnight = dayKeyFromDate(new Date("2026-01-01T23:59:59.999Z"));
		const afterMidnight = dayKeyFromDate(new Date("2026-01-02T00:00:00.000Z"));

		expect(naturalKey(beforeMidnight, -100, "x")).not.toBe(
			naturalKey(afterMidnight, -100, "x"),
		);
	});

	test("naturalKey uses toFixed(2) equality, sidestepping float precision noise", () => {
		const a = naturalKey(dayKeyFromISODate("2026-01-01"), 0.1 + 0.2, "x");
		const b = naturalKey(dayKeyFromISODate("2026-01-01"), 0.3, "x");

		expect(a).toBe(b);
	});
});
