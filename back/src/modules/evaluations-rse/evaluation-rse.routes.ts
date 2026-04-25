import { Router } from "express";

import { authenticate, authorize } from "../../core/middleware/auth.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { EvaluationRseController } from "./evaluation-rse.controller";
import {
  evaluationCompanyParamSchema,
  evaluationIdParamSchema,
  updateIndicateursEnvironnementauxSchema,
  updateIndicateursGouvernanceRseSchema,
  updateIndicateursSociauxSchema,
  updateLabelsEngagementsRseSchema,
} from "./evaluation-rse.schemas";

const router = Router();
const controller = new EvaluationRseController();

router.get(
  "/companies/:entrepriseId",
  authenticate,
  validate(evaluationCompanyParamSchema),
  controller.listByCompany,
);

router.get(
  "/companies/:entrepriseId/active",
  authenticate,
  validate(evaluationCompanyParamSchema),
  controller.getActive,
);

router.get(
  "/companies/:entrepriseId/current",
  authenticate,
  authorize("ADMIN"),
  validate(evaluationCompanyParamSchema),
  controller.getCurrentDraft,
);

router.post(
  "/companies/:entrepriseId/current",
  authenticate,
  authorize("ADMIN"),
  validate(evaluationCompanyParamSchema),
  controller.saveCurrent,
);

router.get(
  "/:id",
  authenticate,
  validate(evaluationIdParamSchema),
  controller.getById,
);

router.patch(
  "/:id/labels-engagements-rse",
  authenticate,
  authorize("ADMIN"),
  validate(updateLabelsEngagementsRseSchema),
  controller.updateLabelsEngagementsRse,
);

router.patch(
  "/:id/indicateurs-environnementaux",
  authenticate,
  authorize("ADMIN"),
  validate(updateIndicateursEnvironnementauxSchema),
  controller.updateIndicateursEnvironnementaux,
);

router.patch(
  "/:id/indicateurs-sociaux",
  authenticate,
  authorize("ADMIN"),
  validate(updateIndicateursSociauxSchema),
  controller.updateIndicateursSociaux,
);

router.patch(
  "/:id/indicateurs-gouvernance-rse",
  authenticate,
  authorize("ADMIN"),
  validate(updateIndicateursGouvernanceRseSchema),
  controller.updateIndicateursGouvernanceRse,
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(evaluationIdParamSchema),
  controller.delete,
);

export { router as evaluationRseRouter };
