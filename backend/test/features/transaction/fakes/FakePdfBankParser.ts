import { PdfBankParser } from "../../../../src/features/transaction/domain/pdfImport/PdfBankParser";
import { ParsedStatement } from "../../../../src/features/transaction/domain/pdfImport/ParsedStatement";

export class FakePdfBankParser implements PdfBankParser {
	constructor(private readonly response: ParsedStatement) {}

	parse = (_pdf: Buffer, _filename: string): Promise<ParsedStatement> => {
		return Promise.resolve(this.response);
	};
}
