import { Router } from "../../../deps.ts";
import { CategoryByIdGetter } from "../../application/useCases/category/categoryByIdGetter.ts";
import { CategoryGetter } from "../../application/useCases/category/categoryGetter.ts";
import { CategoryController } from "../Controllers/category.controller.ts";
import {
  deleteCategory,
  saveCategory,
  updateCategory,
} from "../Controllers/category.controller.ts";
import { MongoCategoryRepository } from "../implementations/mongo/MongoCategory.repository.ts";

const categoryRepository = new MongoCategoryRepository();
const categoryController = new CategoryController(
  new CategoryByIdGetter(categoryRepository),
  new CategoryGetter(categoryRepository),
);

const router = new Router();

router
  .get("/categories", categoryController.getCategories)
  .post("/categories", saveCategory)
  .get("/categories/:id", categoryController.getCategory)
  .put("/categories/:id", updateCategory)
  .delete("/categories/:id", deleteCategory);

export default router;
