const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();
const asyncHandler = require("./setup/asyncHandler");

const studentRouter = require("./routes/student");
const loginRouter = require("./routes/login");
const notesRouter = require("./routes/notes");
const adminRouter = require("./routes/admin");

const app = express();
const port = process.env.PORT;
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
require("./setup/mongoose");
require("./setup/passport");

app.use("/login", loginRouter);
app.use("/student", studentRouter);
app.use("/admin", adminRouter);
app.use("/notes", notesRouter);

app.get("/ping", (_req, res) => {
  res.status(200).end();
});

const errorMiddleware = (err, _req, res, _next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

app.post(
  "/contactForm",
  asyncHandler(async (req, res) => {
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

app.use(errorMiddleware);

app.listen(process.env.PORT || port, () => {
  console.log(`Server is listening at http://localhost:${port} `);
});
