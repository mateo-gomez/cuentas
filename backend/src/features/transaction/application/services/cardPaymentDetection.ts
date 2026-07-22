// Heuristic detection of credit-card payment rows in a bank-account statement.
// These are money leaving the bank account to pay a card; the underlying
// purchases were already recorded as expenses on the card, so importing the
// payment as another expense double-counts it. The importer flags such rows so
// the user can import them as a transfer instead. This is ADVISORY only — the
// user always confirms and picks the destination card.
const CARD_PAYMENT_PATTERNS: RegExp[] = [
	// "PAGO TARJETA", "ABONO A TARJETA DE CREDITO", "PAGO A SU TARJETA", etc.
	/(pago|abono)\b[\s\S]*\btarjeta\b/i,
	// "TARJETA DE CREDITO" as the leading subject of the line
	/\btarjeta\s+de\s+cr[eé]dito\b/i,
	// "PAGO TC" / "ABONO TC" shorthand
	/\b(pago|abono)\s+tc\b/i,
	// PSE payment to Davivienda — Rappi card is issued by Davivienda, so a PSE
	// payment to that bank is really a card payment (no "tarjeta" in the text).
	/\bpago\s+pse\b[\s\S]*\bdavivienda\b/i,
	// PSE payment labeled "PAGOS ELECTRONICOS" — Davibank card payment.
	/\bpago\s+pse\b[\s\S]*\bpagos\s+electr[oó]nicos\b/i,
];

export const isLikelyCardPayment = (description: string): boolean => {
	if (!description) {
		return false;
	}

	return CARD_PAYMENT_PATTERNS.some((pattern) => pattern.test(description));
};
