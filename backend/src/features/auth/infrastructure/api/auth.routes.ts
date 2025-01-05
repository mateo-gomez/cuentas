import { Router } from "../../../../../deps.ts";
import { container } from "../../../../infrastructure/container.ts";
import { AuthController } from "./auth.controller.ts";

const authController = new AuthController(
  container.authSignin,
  container.authSignup,
);

const router = new Router();

router
  .post("/auth/signin", authController.signin)
  .post("/auth/signup", authController.signup);

export default router;
