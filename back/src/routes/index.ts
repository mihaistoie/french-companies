import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes";
import { categorieJuridiqueRouter } from "../modules/categorie-juridique/categorie-juridique.routes";
import { codeNafRouter } from "../modules/code-naf/code-naf.routes";
import { companyRouter } from "../modules/companies/company.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/code-naf", codeNafRouter);
apiRouter.use("/categorie-juridique", categorieJuridiqueRouter);
apiRouter.use("/companies", companyRouter);

export { apiRouter };
