import OpenAI from "openai";
import config from "../../../../../config/config";

// Minimal shape the classifier needs from a category. Kept structural so both
// the domain Category entity and lightweight test fixtures satisfy it.
export interface ClassifiableCategory {
	name: string;
}

// Keyword -> concept rules. Each rule maps a set of merchant/keyword patterns to
// a concept name that mirrors the default category names seeded by
// UserDefaultsBootstrapper. A rule only produces a category when the USER
// actually has a category with that name (accent/case-insensitive) — we never
// invent categories the user doesn't own. Order matters: the first matching rule
// wins, so put the more specific patterns first. Patterns are matched against a
// normalized (accent- and case-insensitive) description.
interface ClassificationRule {
	concept: string;
	pattern: RegExp;
}

const CATEGORY_RULES: ClassificationRule[] = [
	// Ingresos
	{
		concept: "Ingresos",
		pattern:
			/nomina|abono|consignacion|deposito|dispersion|transferencia recibida|pago recibido|reintegro|devolucion|rendimiento|interes/,
	},

	// Salud
	{
		concept: "Salud",
		pattern:
			/farmacia|drogueria|cruz verde|farmatodo|eps|ips|clinica|hospital|medico|odontolog|laboratorio|colsanitas|sura eps|sanitas|funeraria|healthy|muscle|gimnasio|gym|smartfit|bodytech/,
	},

	// Transporte
	{
		concept: "Transporte",
		pattern:
			/uber|didi|cabify|indriver|taxi|civica|metro|transmilenio|transporte|gasolina|combustible|terpel|biomax|texaco|mobil|estacion de servicio|parqueadero|parking|peaje|tecnimecanica|tornimotos|soat|revision tecnico/,
	},

	// Servicios (utilities & telecom)
	{
		concept: "Servicios",
		pattern:
			/tigo|claro|movistar|\bwom\b|\bune\b|etb|epm|energia|electricidad|acueducto|\bagua\b|gas natural|vanti|internet|telefon|celular|recarga|factura de servicio|servicio publico/,
	},

	// Entretenimiento
	{
		concept: "Entretenimiento",
		pattern:
			/netflix|spotify|disney|hbo|max|prime video|youtube|paramount|deezer|apple music|cine|cinemark|cinepolis|procinal|steam|playstation|xbox|nintendo|videojuego|\bbar\b|discoteca|concierto|teatro/,
	},

	// Alimentación
	{
		concept: "Alimentación",
		pattern:
			/rappi|didi food|ifood|domicilio|restaurante|comida|mcdonald|burger|kfc|dominos|pizza|frisby|el corral|juan valdez|starbucks|tostao|panaderia|cafeteria|\bcafe\b|supermercado|exito|carulla|jumbo|olimpica|\bd1\b|ara|justo|euro|makro|dollarcity|mercado|fruver/,
	},

	// Compras
	{
		concept: "Compras",
		pattern:
			/falabella|homecenter|alkosto|ktronix|mercadolibre|mercado libre|amazon|aliexpress|\bzara\b|\bh&m\b|arturo calle|koaj|adidas|nike|tienda|ropa|calzado|almacen|centro comercial|shein/,
	},

	// Hogar
	{
		concept: "Hogar",
		pattern:
			/arriendo|alquiler|administracion|ferreteria|muebles|hogar|inmobiliaria|aseo|lavanderia|domestic/,
	},
];

const normalize = (text: string): string =>
	text
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.trim();

// Whole-word (or phrase) match: true when `needle` appears in `haystack`
// bounded by non-alphanumeric characters, so "ara" doesn't match "farmacia".
const containsWord = (haystack: string, needle: string): boolean => {
	if (!needle) return false;
	const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "u").test(
		haystack,
	);
};

export class CategoryClassifier {
	private client: OpenAI | null = null;

	private getClient = (): OpenAI => {
		if (!this.client) {
			this.client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
		}
		return this.client;
	};

	AIClassify = async (
		description: string,
		categories: ClassifiableCategory[],
	): Promise<string> => {
		if (categories.length === 0) return "";

		const options = categories.map((category) => category.name).join(", ");
		const prompt = `Clasifica esta transacción bancaria en EXACTAMENTE una de estas categorías: ${options}.\nResponde solo con el nombre exacto de la categoría.\n\nDescripción: "${description}"\nCategoría:`;
		const response = await this.getClient().chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [{ role: "user", content: prompt }],
			max_tokens: 15,
			temperature: 0.2,
		});

		const answer = normalize(response.choices[0].message.content ?? "");

		// Only accept an answer that maps back to one of the user's categories;
		// anything else falls back to "unclassified" so a hallucinated label never
		// invents a category.
		const match = categories.find(
			(category) => normalize(category.name) === answer,
		);

		return match?.name ?? "";
	};

	// Rule-based classifier used by the Excel and PDF importers. Matches a
	// description against the USER'S OWN categories (defaults + custom) and returns
	// the exact matching category name, or "" when nothing matches (callers treat
	// "" as "leave uncategorized").
	//
	// Two strategies, in order:
	//   1. Direct match — the description mentions a user category by name
	//      (e.g. a custom "Mascotas" category and a "PETLAND MASCOTAS" charge).
	//      Longer category names win so the most specific one is picked.
	//   2. Keyword rules — map common merchants/keywords to a concept, then use it
	//      only if the user has a category with that concept's name.
	localClassify = (
		description: string,
		categories: ClassifiableCategory[],
	): string => {
		if (!description || categories.length === 0) return "";

		const normalized = normalize(description);

		// Strategy 1: direct name mention (most specific first).
		const direct = [...categories]
			.sort((a, b) => b.name.length - a.name.length)
			.find((category) => containsWord(normalized, normalize(category.name)));

		if (direct) return direct.name;

		// Strategy 2: keyword rule -> concept -> user category with that name.
		const rule = CATEGORY_RULES.find((entry) => entry.pattern.test(normalized));

		if (rule) {
			const concept = normalize(rule.concept);
			const owned = categories.find(
				(category) => normalize(category.name) === concept,
			);
			if (owned) return owned.name;
		}

		return "";
	};
}
