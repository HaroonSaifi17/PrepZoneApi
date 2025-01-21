import { Request, Response, NextFunction, RequestHandler } from 'express';

export const authenticateAnyRole = (...middlewares: RequestHandler[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let error = null;
    
    for (const middleware of middlewares) {
      try {
        await new Promise<void>((resolve) => {
          middleware(req, res, (err:any) => {
            if (err) throw err;
            resolve();
          });
        });
        return next();
      } catch (err) {
        error = err;
        continue;
      }
    }
    return next(error);
  };
};
