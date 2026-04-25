import { RequestHandler } from "express";

import { EvaluationRseService } from "./evaluation-rse.service";

const evaluationRseService = new EvaluationRseService();

export class EvaluationRseController {
  getById: RequestHandler<{ id: string }> = async (req, res) => {
    const evaluation = await evaluationRseService.getById(req.params.id);
    res.status(200).json(evaluation);
  };

  listByCompany: RequestHandler<{ entrepriseId: string }> = async (req, res) => {
    const evaluations = await evaluationRseService.listByCompany(req.params.entrepriseId);
    res.status(200).json({ items: evaluations });
  };

  getActive: RequestHandler<{ entrepriseId: string }> = async (req, res) => {
    const evaluation = await evaluationRseService.getActive(req.params.entrepriseId);
    res.status(200).json({ evaluation });
  };

  getCurrentDraft: RequestHandler<{ entrepriseId: string }> = async (req, res) => {
    const evaluation = await evaluationRseService.getCurrentDraft(req.params.entrepriseId);
    res.status(200).json(evaluation);
  };

  saveCurrent: RequestHandler<{ entrepriseId: string }> = async (req, res) => {
    const evaluation = await evaluationRseService.saveCurrent(req.params.entrepriseId);
    res.status(201).json(evaluation);
  };

  updateLabelsEngagementsRse: RequestHandler<{ id: string }> = async (req, res) => {
    const evaluation = await evaluationRseService.updateLabelsEngagementsRse(
      req.params.id,
      req.body,
    );
    res.status(200).json(evaluation);
  };

  updateIndicateursEnvironnementaux: RequestHandler<{ id: string }> = async (req, res) => {
    const evaluation = await evaluationRseService.updateIndicateursEnvironnementaux(
      req.params.id,
      req.body,
    );
    res.status(200).json(evaluation);
  };

  updateIndicateursSociaux: RequestHandler<{ id: string }> = async (req, res) => {
    const evaluation = await evaluationRseService.updateIndicateursSociaux(
      req.params.id,
      req.body,
    );
    res.status(200).json(evaluation);
  };

  updateIndicateursGouvernanceRse: RequestHandler<{ id: string }> = async (req, res) => {
    const evaluation = await evaluationRseService.updateIndicateursGouvernanceRse(
      req.params.id,
      req.body,
    );
    res.status(200).json(evaluation);
  };

  delete: RequestHandler<{ id: string }> = async (req, res) => {
    const result = await evaluationRseService.delete(req.params.id);
    res.status(200).json(result);
  };
}
