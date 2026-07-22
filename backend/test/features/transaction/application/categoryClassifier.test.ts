import { CategoryClassifier } from "../../../../src/features/transaction/application/services/categoryClassifier";
import { DEFAULT_CATEGORIES } from "../../../../src/features/category/domain/defaultCategories";

const classifier = new CategoryClassifier();

// The categories a freshly-seeded user has out of the box.
const defaultCategories = DEFAULT_CATEGORIES.map((category) => ({
	name: category.name,
}));

describe("CategoryClassifier.localClassify", () => {
	describe("keyword rules resolve to the user's matching category", () => {
		test.each([
			["Compra RAPPI restaurante", "Alimentación"],
			["EXITO supermercado carrera 50", "Alimentación"],
			["UBER trip 12:30", "Transporte"],
			["Recarga civica metro", "Transporte"],
			["Pago TIGO factura", "Servicios"],
			["Netflix suscripcion mensual", "Entretenimiento"],
			["Compra en FALABELLA", "Compras"],
			["Farmacia cruz verde", "Salud"],
			["Pago de NOMINA empresa", "Ingresos"],
			["Arriendo apartamento", "Hogar"],
		])("classifies %p as %p", (description, expected) => {
			expect(classifier.localClassify(description, defaultCategories)).toBe(
				expected,
			);
		});
	});

	test("matches a user's CUSTOM category mentioned by name in the description", () => {
		const categories = [...defaultCategories, { name: "Mascotas" }];

		expect(
			classifier.localClassify("PETLAND compra mascotas premium", categories),
		).toBe("Mascotas");
	});

	test("direct category-name match is accent- and case-insensitive", () => {
		const categories = [{ name: "Educación" }];

		expect(
			classifier.localClassify("Pago EDUCACION universidad", categories),
		).toBe("Educación");
	});

	test("does NOT invent a category the user does not have", () => {
		// User has no "Transporte" category → keyword rule finds nothing to link to.
		const categories = [{ name: "Alimentación" }, { name: "Salud" }];

		expect(classifier.localClassify("UBER trip", categories)).toBe("");
	});

	test("returns an empty string when nothing matches or there are no categories", () => {
		expect(
			classifier.localClassify("xyz123 unknown merchant", defaultCategories),
		).toBe("");
		expect(classifier.localClassify("", defaultCategories)).toBe("");
		expect(classifier.localClassify("rappi", [])).toBe("");
	});

	test("only ever returns a name from the provided categories or an empty string", () => {
		const allowed = new Set(defaultCategories.map((c) => c.name));
		const samples = ["rappi", "uber", "tigo", "netflix", "falabella", "random"];

		for (const sample of samples) {
			const result = classifier.localClassify(sample, defaultCategories);
			expect(result === "" || allowed.has(result)).toBe(true);
		}
	});
});
