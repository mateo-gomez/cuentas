import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { getCategories } from "../Controllers/category.controller.ts";

const router = new Router();

router.get("/categories", getCategories);

export default router;
