import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";

/**
 * Duplicate-detection natural key (design Decision 9).
 * Both sides (stored transactions and parsed preview rows) MUST collapse to the
 * same canonical signed number + normalized day/description before comparing.
 */

export const dayKeyFromISODate = (isoDate: string): string => isoDate.slice(0, 10);

export const dayKeyFromDate = (date: Date): string => date.toISOString().slice(0, 10);

// Stored transactions keep an UNSIGNED magnitude + a separate `type` enum.
// Parsed preview rows already carry a SIGNED value. This derives a canonical
// signed number for the stored side so both sides compare like-for-like.
export const signedValueFromStored = (
	value: number,
	type: TransactionType,
): number => (type === TransactionType.expenses ? -Math.abs(value) : Math.abs(value));

export const naturalKey = (
	dayKey: string,
	signedValue: number,
	description: string,
): string => `${dayKey}|${signedValue.toFixed(2)}|${description.trim().toLowerCase()}`;

export const startOfUTCDay = (date: Date): Date =>
	new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			0,
			0,
			0,
			0,
		),
	);

export const endOfUTCDay = (date: Date): Date =>
	new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			23,
			59,
			59,
			999,
		),
	);
