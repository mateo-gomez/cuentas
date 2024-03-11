import { Router } from "../../../deps.ts";
import { CategoryByIdGetter } from "../../application/useCases/category/categoryByIdGetter.ts";
import { CategoryController } from "../Controllers/category.controller.ts";
import {
  deleteCategory,
  getCategories,
  saveCategory,
  updateCategory,
} from "../Controllers/category.controller.ts";
import { MongoCategoryRepository } from "../implementations/mongo/MongoCategory.repository.ts";

const categoryRepository = new MongoCategoryRepository();
const categoryByIdGetter = new CategoryByIdGetter(categoryRepository);
const categoryController = new CategoryController(categoryByIdGetter);

const router = new Router();

router
  .get("/categories", getCategories)
  .post("/categories", saveCategory)
  .get("/categories/:id", categoryController.getCategory)
  .put("/categories/:id", updateCategory)
  .delete("/categories/:id", deleteCategory);

export default router;
