import fs from "fs";
import path from "path";
import crypto from "crypto";
import zlib from "zlib";

export function hashObject(
  {
    root,
    filename,
  }: {
    root: string;
    filename: string;
  },
  options: { write?: boolean } = {}
): string {
  const content = fs.readFileSync(filename);
  const header = `blob ${content.length}\x00`;
  const data = header + content;
  const hash = crypto.createHash("sha1").update(data).digest("hex");

  const objectsDirPath = path.join(root, ".git", "objects");
  const hashDirPath = path.join(objectsDirPath, hash.slice(0, 2));
  const filePath = path.join(hashDirPath, hash.slice(2));

  if (options.write == true) {
    fs.mkdirSync(hashDirPath, { recursive: true });
    fs.writeFileSync(filePath, zlib.deflateSync(data));
  }

  return hash;
}
