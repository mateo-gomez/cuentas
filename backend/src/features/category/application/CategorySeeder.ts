import { CategoryRepository } from "../domain/category.repository";

// Fallback category used when an imported transaction has no category assigned.
export const DEFAULT_CATEGORY_NAME = "Sin categoría";

// Seeded on startup so users have categories out of the box and the PDF import
// picker is never empty. Icons are Ionicons names (rendered by CategoryChip).
export const DEFAULT_CATEGORIES: { name: string; icon: string }[] = [
	{ name: DEFAULT_CATEGORY_NAME, icon: "help-circle-outline" },
	{ name: "Alimentación", icon: "fast-food-outline" },
	{ name: "Transporte", icon: "bus-outline" },
	{ name: "Servicios", icon: "flash-outline" },
	{ name: "Salud", icon: "medkit-outline" },
	{ name: "Entretenimiento", icon: "game-controller-outline" },
	{ name: "Compras", icon: "bag-outline" },
	{ name: "Hogar", icon: "home-outline" },
	{ name: "Ingresos", icon: "cash-outline" },
	{ name: "Transferencias", icon: "swap-horizontal-outline" },
];

// Idempotent get-or-create of the default categories. Safe to run on every
// boot: existing categories (matched by name) are left untouched, and a
// default that a user deleted is recreated on the next startup.
export class CategorySeeder {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	seed = async (): Promise<void> => {
		for (const { name, icon } of DEFAULT_CATEGORIES) {
			const existing = await this.categoryRepository.getByName(name);

			if (!existing) {
				await this.categoryRepository.createCategory(name, icon);
			}
		}
	};
}
