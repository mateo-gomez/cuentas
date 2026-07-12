import { InMemoryPreviewStore } from "../../../../src/features/transaction/infrastructure/services/InMemoryPreviewStore";
import { PreviewRow } from "../../../../src/features/transaction/application/dto/pdfImportDTO";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";

const row: PreviewRow = {
	rowId: "row-1",
	date: "2026-01-01",
	description: "Test",
	value: 100,
	type: TransactionType.income,
	possibleDuplicate: false,
};

describe("InMemoryPreviewStore", () => {
	test("stores and retrieves a preview by session id", () => {
		const store = new InMemoryPreviewStore(1000, false);

		const importSessionId = store.put([row], "bancolombia", []);
		const record = store.get(importSessionId);

		expect(record).not.toBeNull();
		expect(record?.bankId).toBe("bancolombia");
		expect(record?.rows).toEqual([row]);
	});

	test("returns null for a missing session id", () => {
		const store = new InMemoryPreviewStore(1000, false);

		expect(store.get("unknown")).toBeNull();
	});

	test("expires a preview after its ttl elapses", () => {
		jest.useFakeTimers();
		const store = new InMemoryPreviewStore(1000, false);

		const importSessionId = store.put([row], "bancolombia", []);
		jest.advanceTimersByTime(1001);

		expect(store.get(importSessionId)).toBeNull();
		jest.useRealTimers();
	});

	test("delete makes a session single-use", () => {
		const store = new InMemoryPreviewStore(1000, false);

		const importSessionId = store.put([row], "bancolombia", []);
		store.delete(importSessionId);

		expect(store.get(importSessionId)).toBeNull();
	});

	test("take atomically returns the record and removes it", () => {
		const store = new InMemoryPreviewStore(1000, false);

		const importSessionId = store.put([row], "bancolombia", []);
		const record = store.take(importSessionId);

		expect(record).not.toBeNull();
		expect(record?.bankId).toBe("bancolombia");
		expect(store.get(importSessionId)).toBeNull();
	});

	test("a second take of the same session returns null (single-use claim)", () => {
		const store = new InMemoryPreviewStore(1000, false);

		const importSessionId = store.put([row], "bancolombia", []);
		store.take(importSessionId);

		expect(store.take(importSessionId)).toBeNull();
	});

	test("take returns null for an expired session and removes it", () => {
		jest.useFakeTimers();
		const store = new InMemoryPreviewStore(1000, false);

		const importSessionId = store.put([row], "bancolombia", []);
		jest.advanceTimersByTime(1001);

		expect(store.take(importSessionId)).toBeNull();
		jest.useRealTimers();
	});
});
