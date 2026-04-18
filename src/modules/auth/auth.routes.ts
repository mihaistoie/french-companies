import { Router } from "express";

import { authenticate } from "../../core/middleware/auth.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { AuthController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";

const router = Router();
const controller = new AuthController();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.get("/me", authenticate, controller.me);

export { router as authRouter };
