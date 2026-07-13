import { Router } from "express";
import { container } from "../../../../infrastructure/container";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "../../../../infrastructure/api/middlewares/AuthMiddleware";

const authController = new AuthController(
	container.authSignin,
	container.authSignup,
	container.authRefresh,
	container.authLogout,
	container.userDefaultsBootstrapper,
	container.transactionAccountMigrator,
	container.getCurrentUser,
	container.updateProfile,
	container.changePassword
);

const router = Router();

router
	.post("/signin", authController.signin)
	.post("/signup", authController.signup)
	.post("/refresh", authController.refresh)
	.post("/logout", authController.logout);

// The /auth router has NO global auth middleware (signin/signup/refresh/logout
// must stay public) — these 3 routes are guarded individually.
router
	.get("/me", AuthMiddleware.handle(), authController.getMe)
	.patch("/me", AuthMiddleware.handle(), authController.updateMe)
	.post("/change-password", AuthMiddleware.handle(), authController.changePasswordHandler);

export default router;
