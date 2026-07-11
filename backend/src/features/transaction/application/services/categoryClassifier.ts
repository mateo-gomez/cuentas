import OpenAI from "openai";
import config from "../../../../../config/config";

export class CategoryClassifier {
	private client: OpenAI | null = null;

	private getClient = (): OpenAI => {
		if (!this.client) {
			this.client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
		}
		return this.client;
	};

	AIClassify = async (description: string): Promise<string> => {
		const prompt = `Clasifica esta transacción en una categoría como "comida", "transporte", "salud", "hogar", "ocio", "educación", "otros".\n\nDescripción: "${description}"\nCategoría:`;
		const response = await this.getClient().chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [{ role: "user", content: prompt }],
			max_tokens: 10,
			temperature: 0.2,
		});

		return response.choices[0].message.content?.trim().toLowerCase() || "otros";
	};

	localClassify = (description: string): string => {
		const desc = description.toLowerCase();

		if (/funeraria/.test(desc)) return "salud";
		if (/healthy|muscle/.test(desc)) return "salud";
		if (/tornimotos/.test(desc)) return "vehículos";
		if (/suramericana|seguros/.test(desc)) return "seguros";
		if (/civica|transporte/.test(desc)) return "transporte";
		if (/cajero|retiro/.test(desc)) return "efectivo";
		if (/pago de nómina/.test(desc)) return "ingresos";
		if (/tigo/.test(desc)) return "servicios";
		if (/comision|cuota manejo/.test(desc)) return "comisiones";
		if (/intereses/.test(desc)) return "intereses";
		if (/abono/.test(desc)) return "ingresos";

		return "otros";
	};
}
