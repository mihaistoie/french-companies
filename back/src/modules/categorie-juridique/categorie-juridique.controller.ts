import { RequestHandler } from "express";

import {
    CategorieJuridiqueService,
    type AutocompleteCategorieJuridiqueFilters,
} from "./categorie-juridique.service";

const categorieJuridiqueService = new CategorieJuridiqueService();

export class CategorieJuridiqueController {
    autocomplete: RequestHandler = async (req, res) => {
        const result = await categorieJuridiqueService.autocomplete(
            req.query as unknown as AutocompleteCategorieJuridiqueFilters,
        );
        res.status(200).json(result);
    };
}