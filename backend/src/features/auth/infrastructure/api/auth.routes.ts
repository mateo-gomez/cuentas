import { Router } from "express";
import { container } from "../../../../infrastructure/container";
import { AuthController } from "./auth.controller";

const authController = new AuthController(
	container.authSignin,
	container.authSignup
);

const router = Router();

router
	.post("/signin", authController.signin)
	.post("/signup", authController.signup);

export default router;
