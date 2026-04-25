declare global {
  namespace Express {
    interface Request {
      lang?: "fr" | "en";
      user?: {
        sub: string;
        email: string;
        role: string;
      };
    }
  }
}

export {};
