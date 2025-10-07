import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

export function getDataUri(file) {
  const ext = file.mimetype.split("/")[1];
  return parser.format(ext, file.buffer).content;
}
