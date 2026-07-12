import { ParsedStatement } from "./ParsedStatement";

export interface PdfBankParser {
	// throws UnsupportedBankError (422) on unrecognized_bank
	parse: (pdf: Buffer, filename: string) => Promise<ParsedStatement>;
}
