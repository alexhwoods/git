import fs from "fs";
import path from "path";
import zlib from "zlib";

/*
 *
 * Find an object to test this with by running:
 * git rev-list --objects --all
 */
export function catFile({ root, hash }: { root: string; hash: string }) {
  const objectPath = path.join(
    root,
    ".git",
    "objects",
    hash.slice(0, 2),
    hash.slice(2)
  );

  const rawData = fs.readFileSync(objectPath);
  const data = zlib.inflateSync(rawData);
  const [header, content] = data.toString().split("\x00");

  return content;
}
