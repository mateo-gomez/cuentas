import { PreviewRow } from "../../application/dto/pdfImportDTO";

export interface PreviewRecord {
	bankId: string;
	rows: PreviewRow[];
	warnings: string[];
	expiresAt: number; // epoch ms
}

export interface PreviewStore {
	put: (rows: PreviewRow[], bankId: string, warnings: string[]) => string; // returns importSessionId
	get: (importSessionId: string) => PreviewRecord | null; // null if missing/expired
	take: (importSessionId: string) => PreviewRecord | null; // atomic get-and-remove; null if missing/expired
	delete: (importSessionId: string) => void;
}
