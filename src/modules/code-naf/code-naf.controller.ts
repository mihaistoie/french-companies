import { RequestHandler } from "express";

import {
  CodeNafService,
  type AutocompleteCodeNafFilters,
  type ListCodeNafFilters,
} from "./code-naf.service";

const codeNafService = new CodeNafService();

export class CodeNafController {
  list: RequestHandler = async (req, res) => {
    const result = await codeNafService.list(
      req.query as unknown as ListCodeNafFilters,
    );
    res.status(200).json(result);
  };

  autocomplete: RequestHandler = async (req, res) => {
    const result = await codeNafService.autocomplete(
      req.query as unknown as AutocompleteCodeNafFilters,
    );
    res.status(200).json(result);
  };
}
