import express from "express";
import path from "path";
import passport from "passport";
import multer from "multer";
import Pdf from "../models/notes";
import asyncWrapper from "../utils/asyncWrapper";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "./src/files/pdf");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length,
    );
    const name = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

router.post(
  "/",
  passport.authenticate("adminJwt", { session: false }),
  upload.single("pdf"),
  asyncWrapper(async (req, res) => {
    if (!req.file) {
      res.status(400).send("No file uploaded");
      return;
    }
    const pdf = new Pdf({
      name: req.body.name,
      subject: req.body.subject,
      url: req.file.filename,
      date: new Date().toLocaleString(),
    });
    await pdf.save();
    res.status(200).end();
  }),
);

router.get(
  "/pdf/:url",
  asyncWrapper(async (req, res) => {
    const fileUrl = req.params.url;
    const filePath = path.join(__dirname, "../files/pdf/", fileUrl);
    res.sendFile(filePath);
  }),
);

router.get(
  "/pdfs",
  passport.authenticate("jwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page as string) - 1 || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const sort = parseInt(req.query.sort as string) || -1;
    let genre: string | string[] = (req.query.subject as string) || "All";

    const genreOptions = ["physics", "chemistry", "math", "biology"];

    if (genre === "All") {
      genre = [...genreOptions];
    } else {
      genre = genre.split(",");
    }

    const pdfs = await Pdf.find({ name: { $regex: search, $options: "i" } })
      .where("subject")
      .in([...genre])
      .sort({ date: sort as 1 | -1 })
      .skip(page * limit)
      .limit(limit)
      .select("name url");

    const total = await Pdf.countDocuments({
      subject: { $in: [...genre] },
      name: { $regex: search, $options: "i" },
    });

    const totalPageCount = Math.ceil(total / limit);
    const pageno = Array.from({ length: totalPageCount }, (_, i) => i + 1);

    const response = {
      error: false,
      total,
      page: page + 1,
      limit,
      pdfs,
      pageno,
    };

    res.status(200).json(response);
  }),
);

export default router;
