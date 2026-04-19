import { RequestHandler } from "express";

import {
  CodeNafService,
  type AutocompleteCodeNafFilters,
} from "./code-naf.service";

const codeNafService = new CodeNafService();

export class CodeNafController {
  autocomplete: RequestHandler = async (req, res) => {
    const result = await codeNafService.autocomplete(
      req.query as unknown as AutocompleteCodeNafFilters,
    );
    res.status(200).json(result);
  };
}
