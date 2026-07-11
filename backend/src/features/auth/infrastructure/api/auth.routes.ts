import { Router } from "express";
import { container } from "../../../../infrastructure/container";
import { AuthController } from "./auth.controller";

const authController = new AuthController(
	container.authSignin,
	container.authSignup,
	container.authRefresh,
	container.authLogout
);

const router = Router();

router
	.post("/signin", authController.signin)
	.post("/signup", authController.signup)
	.post("/refresh", authController.refresh)
	.post("/logout", authController.logout);

export default router;
