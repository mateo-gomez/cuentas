import { Router } from "express";
import { container } from "../../../../infrastructure/container";
import { AuthController } from "./auth.controller";

const authController = new AuthController(
	container.authSignin,
	container.authSignup
);

const router = Router();

router
	.post("/auth/signin", authController.signin)
	.post("/auth/signup", authController.signup);

export default router;
