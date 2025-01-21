import multer, { StorageEngine, Multer } from "multer";

const storagePdf: StorageEngine = multer.diskStorage({
  destination: (
    _req: Express.Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, "./src/files/pdf");
  },
  filename: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.substring(file.originalname.lastIndexOf("."));
    const name = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, name);
  },
});

const storageImg: StorageEngine = multer.diskStorage({
  destination: (
    _req: Express.Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, "./src/files/images");
  },
  filename: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.substring(file.originalname.lastIndexOf("."));
    const name = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, name);
  },
});

const uploadPdf: Multer = multer({ storage: storagePdf });
const uploadImg: Multer = multer({ storage: storageImg });

export { uploadPdf, uploadImg };
