import fs from "fs";
import path from "path";
import crypto from "crypto";
import zlib from "zlib";

export function commitTree({
  root,
  tree,
  message = null,
  parent = null,
  author = null,
}: {
  root: string;
  tree: string;
  message?: string | null;
  parent?: string | null;
  author?: { name: string; email: string } | null;
  date?: string;
}): string {
  if (message == null) {
    throw new Error("Aborting commit due to empty commit message.");
  }

  let body = `tree ${tree}\n`;

  if (parent) {
    body += `parent ${parent}\n`;
  }

  const now = new Date();
  const timestamp = Math.floor(now.valueOf() / 1000);
  const offsetMinutes = now.getTimezoneOffset();
  const offsetSign = offsetMinutes > 0 ? "-" : "+"; // Inverting the sign for Git's convention
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const offsetMinutesPart = Math.abs(offsetMinutes % 60);
  const formattedOffset = `${offsetSign}${offsetHours
    .toString()
    .padStart(2, "0")}${offsetMinutesPart.toString().padStart(2, "0")}`;

  body += `author ${author?.name} <${author?.email}> ${timestamp} ${formattedOffset}\n`;

  body += `\n${message}\n`;

  const header = `commit ${body.length}\x00`;
  const data = Buffer.from(header + body, "utf-8");

  const hash = crypto.createHash("sha1").update(data).digest("hex");

  const objectsDirPath = path.join(root, ".git", "objects");
  const hashDirPath = path.join(objectsDirPath, hash.slice(0, 2));
  const filePath = path.join(hashDirPath, hash.slice(2));

  fs.mkdirSync(hashDirPath, { recursive: true });
  fs.writeFileSync(filePath, zlib.deflateSync(data));

  return hash;
}
