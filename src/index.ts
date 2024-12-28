import express, { Application } from "express";
import cors from "cors";
import "./setup/mongoose";
import dotenv from "dotenv";
import errorMiddleware from "./utils/errorMiddleware";
import asyncWrapper from "./utils/asyncWrapper";

dotenv.config();

import studentRoutes from "./routes/student";
import loginRoutes from "./routes/login";
import notesRoutes from "./routes/notes";
import adminRoutes from "./routes/admin";

const app: Application = express();
const port = process.env.PORT || 8000;
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

import "./setup/passport";
import "./setup/mongoose";

app.use(errorMiddleware);
app.use("/login", loginRoutes);
app.use("/student", studentRoutes);
app.use("/admin", adminRoutes);
app.use("/notes", notesRoutes);

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
