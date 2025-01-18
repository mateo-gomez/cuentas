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
	.get("/categories", categoryController.getCategories)
	.post("/categories", categoryController.saveCategory)
	.get("/categories/:id", categoryController.getCategory)
	.put("/categories/:id", categoryController.updateCategory)
	.delete("/categories/:id", categoryController.deleteCategory);

export default router;
