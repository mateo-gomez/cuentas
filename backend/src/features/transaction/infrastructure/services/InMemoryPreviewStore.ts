import {
	PreviewRecord,
	PreviewStore,
} from "../../domain/pdfImport/PreviewStore";
import { PreviewRow } from "../../application/dto/pdfImportDTO";

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SWEEP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export class InMemoryPreviewStore implements PreviewStore {
	private readonly store = new Map<string, PreviewRecord>();
	private readonly ttlMs: number;
	private readonly sweepInterval?: NodeJS.Timeout;

	constructor(ttlMs: number = DEFAULT_TTL_MS, startSweeper = true) {
		this.ttlMs = ttlMs;

		if (startSweeper) {
			this.sweepInterval = setInterval(() => this.sweep(), SWEEP_INTERVAL_MS);
			this.sweepInterval.unref?.();
		}
	}

	put = (rows: PreviewRow[], bankId: string, warnings: string[]): string => {
		const importSessionId = crypto.randomUUID();

		this.store.set(importSessionId, {
			bankId,
			rows,
			warnings,
			expiresAt: Date.now() + this.ttlMs,
		});

		return importSessionId;
	};

	get = (importSessionId: string): PreviewRecord | null => {
		const record = this.store.get(importSessionId);

		if (!record) {
			return null;
		}

		if (record.expiresAt <= Date.now()) {
			this.store.delete(importSessionId);
			return null;
		}

		return record;
	};

	take = (importSessionId: string): PreviewRecord | null => {
		const record = this.store.get(importSessionId);

		if (!record) {
			return null;
		}

		this.store.delete(importSessionId);

		if (record.expiresAt <= Date.now()) {
			return null;
		}

		return record;
	};

	delete = (importSessionId: string): void => {
		this.store.delete(importSessionId);
	};

	private sweep = (): void => {
		const now = Date.now();

		for (const [importSessionId, record] of this.store.entries()) {
			if (record.expiresAt <= now) {
				this.store.delete(importSessionId);
			}
		}
	};

	stopSweeper = (): void => {
		if (this.sweepInterval) {
			clearInterval(this.sweepInterval);
		}
	};
}
