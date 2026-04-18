import { RequestHandler } from "express";

import { AuthService } from "./auth.service";

const authService = new AuthService();

export class AuthController {
  register: RequestHandler = async (req, res) => {
    const result = await authService.register(req.body.email, req.body.password);
    res.status(201).json(result);
  };

  login: RequestHandler = async (req, res) => {
    const result = await authService.login(req.body.email, req.body.password);
    res.status(200).json(result);
  };

  me: RequestHandler = async (req, res) => {
    const result = await authService.me(req.user!.sub);
    res.status(200).json(result);
  };
}
