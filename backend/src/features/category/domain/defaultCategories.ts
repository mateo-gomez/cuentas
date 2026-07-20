// Fallback category used when an imported transaction has no category assigned.
export const DEFAULT_CATEGORY_NAME = "Sin categoría";

// Category both legs of an account-to-account transfer are tagged with.
export const TRANSFER_CATEGORY_NAME = "Transferencias";
export const TRANSFER_CATEGORY_ICON = "swap-horizontal-outline";

// Seeded per-user by `UserDefaultsBootstrapper` (account-management change) so
// every user has categories out of the box and the PDF import picker is never
// empty. Icons are Ionicons names (rendered by CategoryChip).
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
  { name: TRANSFER_CATEGORY_NAME, icon: TRANSFER_CATEGORY_ICON },
];
