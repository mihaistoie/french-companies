import { Router } from "express";

import { authenticate } from "../../core/middleware/auth.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { CodeNafController } from "./code-naf.controller";
import {
  autocompleteCodeNafSchema,
  listCodeNafSchema,
} from "./code-naf.schemas";

const router = Router();
const controller = new CodeNafController();

router.get("/", authenticate, validate(listCodeNafSchema), controller.list);
router.get(
  "/autocomplete",
  authenticate,
  validate(autocompleteCodeNafSchema),
  controller.autocomplete,
);

export { router as codeNafRouter };
