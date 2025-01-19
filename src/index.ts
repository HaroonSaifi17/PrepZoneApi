import express, { Application } from "express";
import cors from "cors";
import "./setup/mongoose";
import dotenv from "dotenv";
import { errorMiddleware } from "./utils/errorMiddleware";
import asyncWrapper from "./utils/asyncWrapper";

dotenv.config();

import routes from "./routes";

const app: Application = express();
const port = process.env.PORT || 8000;
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

import "./setup/passport";
import "./setup/mongoose";

app.use(errorMiddleware);
app.use("/", routes);

app.post(
  "/contactForm",
  asyncWrapper(async (req, res) => {
    const apiKey = process.env.BOT_API_TOKEN;
    await fetch(`https://api.telegram.org/bot${apiKey}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: 1233632774,
        text: req.body,
      }),
    });
    res.status(200).end();
  }),
);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port} `);
});
