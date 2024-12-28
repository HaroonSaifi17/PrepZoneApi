import multer, { StorageEngine, Multer } from "multer";

let name: string;

const storage: StorageEngine = multer.diskStorage({
  destination: (
    _req: Express.Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, "./files/pdf");
  },
  filename: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.substring(file.originalname.lastIndexOf("."));
    name = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, name);
  },
});

const upload: Multer = multer({ storage });

export { upload, name };
