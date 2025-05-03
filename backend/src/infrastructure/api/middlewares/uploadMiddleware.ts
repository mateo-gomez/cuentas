import multer, { FileFilterCallback } from "multer";
import path from "path";
import { ValidationError } from "../errors/validationError";
import { Request } from "./BaseMiddleware";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
	},
});

export class UploadMiddleware {
	execute = (allowedTypes: string[]) => {
		const fileFilter = (
			_req: Request,
			file: Express.Multer.File,
			cb: FileFilterCallback
		) => {
			if (allowedTypes.includes(file.mimetype)) {
				cb(null, true);
			} else {
				cb(new ValidationError({ file: ["Tipo de archivo no permitido"] }));
			}
		};

		return multer({
			storage,
			fileFilter,
			limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
		});
	};

	static handle(allowedTypes: string[]) {
		return new this().execute(allowedTypes);
	}
}
