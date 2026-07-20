import { isLikelyCardPayment } from "../../../../src/features/transaction/application/services/cardPaymentDetection";

describe("isLikelyCardPayment", () => {
	test.each([
		"PAGO TARJETA DE CREDITO",
		"ABONO A TARJETA",
		"Pago a su tarjeta Visa",
		"TARJETA DE CRÉDITO MASTERCARD",
		"PAGO TC 1234",
	])("flags card-payment description: %s", (description) => {
		expect(isLikelyCardPayment(description)).toBe(true);
	});

	test.each([
		"COMPRA SUPERMERCADO",
		"PAGO NOMINA",
		"TRANSFERENCIA A NEQUI",
		"RETIRO CAJERO",
		"",
	])("does not flag ordinary description: %s", (description) => {
		expect(isLikelyCardPayment(description)).toBe(false);
	});
});
