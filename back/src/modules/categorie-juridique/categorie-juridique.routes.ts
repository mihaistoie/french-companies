import { Router } from "express";

import { authenticate } from "../../core/middleware/auth.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { CategorieJuridiqueController } from "./categorie-juridique.controller";
import { autocompleteCategorieJuridiqueSchema } from "./categorie-juridique.schemas";

const router = Router();
const controller = new CategorieJuridiqueController();

router.get(
    "/autocomplete",
    authenticate,
    validate(autocompleteCategorieJuridiqueSchema),
    controller.autocomplete,
);

export { router as categorieJuridiqueRouter };