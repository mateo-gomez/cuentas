// Render's `fromService` injects a bare hostname (no scheme); local/dev sets a
// full URL. Normalize so the parser client always gets an absolute URL.
const raw = process.env.PDF_PARSER_URL || "http://127.0.0.1:8000";
const PDF_PARSER_URL = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;

export default {
	PDF_PARSER_URL,
};
