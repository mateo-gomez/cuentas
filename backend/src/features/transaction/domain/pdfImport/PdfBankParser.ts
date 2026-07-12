import { ParsedStatement } from "./ParsedStatement";

export interface PdfBankParser {
	// throws UnsupportedBankError (422) on unrecognized_bank / password_required
	parse: (
		pdf: Buffer,
		filename: string,
		password?: string,
	) => Promise<ParsedStatement>;
}
