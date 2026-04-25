import { Router } from "express";

import { authenticate, authorize } from "../../core/middleware/auth.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { CompanyController } from "./company.controller";
import {
  companyIdParamSchema,
  companySiretParamSchema,
  createCompanySchema,
  listCompaniesSchema,
  updateCompanySchema,
} from "./company.schemas";

const router = Router();
const controller = new CompanyController();

router.get("/", authenticate, validate(listCompaniesSchema), controller.list);
router.get(
  "/siret/:siret",
  authenticate,
  authorize("ADMIN"),
  validate(companySiretParamSchema),
  controller.getInfoBySiret,
);
router.get("/:id", authenticate, validate(companyIdParamSchema), controller.getById);
router.post("/", authenticate, authorize("ADMIN"), validate(createCompanySchema), controller.create);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateCompanySchema), controller.update);
router.delete("/:id", authenticate, authorize("ADMIN"), validate(companyIdParamSchema), controller.delete);

export { router as companyRouter };
