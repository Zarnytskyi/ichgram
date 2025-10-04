import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

export default function getDataUri(file) {
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer).content;
}
