export class UnsupportedBankError extends Error {
	public readonly statusCode = 422;
	public readonly code:
		| "unrecognized_bank"
		| "too_many_pages"
		| "password_required";

	constructor(
		message: string,
		code:
			| "unrecognized_bank"
			| "too_many_pages"
			| "password_required" = "unrecognized_bank",
	) {
		super(message);

		this.name = "UnsupportedBankError";
		this.code = code;
	}
}
