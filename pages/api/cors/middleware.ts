import { NextApiRequest, NextApiResponse } from "next";

type MiddlewareFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => void;

export const corsMiddleware: MiddlewareFunction = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
};

// Middleware wrapper for Next.js API routes
export const withMiddleware =
  (...middlewares: MiddlewareFunction[]) =>
  (handler: (req: NextApiRequest, res: NextApiResponse) => void) =>
  (req: NextApiRequest, res: NextApiResponse) => {
    const runMiddlewares = (index: number) => {
      if (index < middlewares.length) {
        middlewares[index](req, res, () => runMiddlewares(index + 1));
      } else {
        handler(req, res);
      }
    };
    runMiddlewares(0);
  };
