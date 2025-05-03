import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { ExcelParserImpl } from "../infrastructure/excel/ExcelParserImpl";

describe("ExcelParserImpl", () => {
	const testFilePath = path.join(__dirname, "test.xlsx");

	beforeAll(async () => {
		// Crear un workbook con la estructura necesaria
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Sheet1");

		// Fila 1: Información general (DESDE: y fecha en formato dd/mm/yyyy)
		worksheet.getCell("A1").value = "DESDE:";
		worksheet.getCell("B1").value = "01/01/2022";

		// Fila 2: Puede contener otro dato (opcional)
		worksheet.getCell("A2").value = "Otro dato";

		// Fila 3: Indicador de inicio de transacciones
		worksheet.getCell("A3").value = "Movimientos:";

		// Fila 4: Cabecera (se omitirá en el parseo)
		worksheet.getRow(4).values = [
			"fecha",
			"descripcion",
			"sucursal",
			"Dcto",
			"Valor",
			"saldo",
		];

		// Fila 5: Registro de transacción
		worksheet.getRow(5).values = [
			"15/01",
			"Compra",
			"Sucursal A",
			"Dcto info",
			"100.50",
			"saldo info",
		];

		// Fila 6: Fila vacía para terminar la sección
		worksheet.getCell("A6").value = "";

		await workbook.xlsx.writeFile(testFilePath);
	});

	afterAll(async () => {
		// Eliminar el archivo de prueba
		await fs.promises.unlink(testFilePath);
	});

	test("should correctly parse transactions from the Excel file", async () => {
		const parser = new ExcelParserImpl();
		const transactions = await parser.parse(testFilePath);

		expect(transactions).toHaveLength(1);
		const tx = transactions[0];
		expect(tx.description).toBe("Compra");
		expect(tx.amount).toBeCloseTo(100.5);

		// Validar que la fecha se construya con el año extraído ("2022")
		const expectedDate = new Date(2022, 0, 15);
		expect(tx.date.getFullYear()).toBe(expectedDate.getFullYear());
		expect(tx.date.getMonth()).toBe(expectedDate.getMonth());
		expect(tx.date.getDate()).toBe(expectedDate.getDate());

		// Para montos positivos se asume INCOME
		expect(tx.type).toBe("INCOME");
	});
});
