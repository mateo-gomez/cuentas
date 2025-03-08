import { CategoryController } from "./category.controller";
import { container } from "../../../../infrastructure/container";
import { Router } from "express";

const categoryController = new CategoryController(
	container.categoryByIdGetter,
	container.categoryGetter,
	container.categoryCreator,
	container.categoryUpdater,
	container.categoryRemover
);

const router = Router();

router
	.get("/", categoryController.getCategories)
	.post("/", categoryController.saveCategory)
	.get("/:id", categoryController.getCategory)
	.put("/:id", categoryController.updateCategory)
	.delete("/:id", categoryController.deleteCategory);

export default router;
