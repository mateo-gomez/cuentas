import { Router } from "../deps.ts";
import {
  deleteCategory,
  getCategories,
  getCategory,
  saveCategory,
  updateCategory,
} from "../Controllers/category.controller.ts";

const router = new Router();

router
  .get("/categories", getCategories)
  .post("/categories", saveCategory)
  .get("/categories/:id", getCategory)
  .put("/categories/:id", updateCategory)
  .delete("/categories/:id", deleteCategory);

export default router;
