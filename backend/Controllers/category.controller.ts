import { type Response } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import categoriesData from "../database/categories.js";

export const getCategories = ({ response }: { response: Response }) => {
  response.body = categoriesData;
};
