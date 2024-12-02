import express, { Application, Request, Response } from "express";

import globalErrorHandler from "./app/Error-Handler/globalErrorHandler";
import normalMiddleware from "./app/middleware/normalMiddleware";
import { AuthRoutes } from "./app/Modules/Auth/Auth.route";

const app: Application = express();
normalMiddleware(app);

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "A-9-Postgres-Prisma  server..",
  });
});

app.use("/api/auth", AuthRoutes);

app.all("*", (req: Request, res: Response, next) => {
  const error = new Error(`Can't find ${req.url} on the server`);
  next(error);
});

// global error handle
app.use(globalErrorHandler);

export default app;
