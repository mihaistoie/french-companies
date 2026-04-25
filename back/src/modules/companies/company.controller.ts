import { RequestHandler } from "express";

import { CompanyService, type CompanyFilters } from "./company.service";

const companyService = new CompanyService();

export class CompanyController {
  create: RequestHandler = async (req, res) => {
    const company = await companyService.create(req.body);
    res.status(201).json(company);
  };

  list: RequestHandler = async (req, res) => {
    const companies = await companyService.list(req.query as unknown as CompanyFilters);
    res.status(200).json(companies);
  };

  getById: RequestHandler<{ id: string }> = async (req, res) => {
    const company = await companyService.getById(req.params.id);
    res.status(200).json(company);
  };

  getInfoBySiret: RequestHandler<{ siret: string }> = async (req, res) => {
    const info = await companyService.getInfoSiret(req.params.siret);
    res.status(200).json(info);
  };

  update: RequestHandler<{ id: string }> = async (req, res) => {
    const company = await companyService.update(req.params.id, req.body);
    res.status(200).json(company);
  };

  delete: RequestHandler<{ id: string }> = async (req, res) => {
    const result = await companyService.delete(req.params.id);
    res.status(200).json(result);
  };
}
