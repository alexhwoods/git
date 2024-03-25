import fs from "fs";
import path from "path";
import zlib from "zlib";

import { modeSchema, modeToObjectType } from "../types";

export function lsTree(
  { root, hash, prefix = "" }: { root: string; hash: string; prefix?: string },
  options: { nameOnly?: boolean; recursive?: boolean } = {}
): string[] {
  const rawData = fs.readFileSync(
    path.join(root, ".git", "objects", hash.slice(0, 2), hash.slice(2)),
    null // Ensuring binary read
  );
  const data = zlib.inflateSync(rawData);

  // Skip the 'tree' declaration and size at the beginning
  let position = data.indexOf(0) + 1; // Find the first null character and move beyond it

  const entries: string[] = [];
  while (position < data.length) {
    let space = data.indexOf(32, position); // ASCII space (' ')
    let nullChar = data.indexOf(0, space); // Null character

    const mode = modeSchema.parse(
      // @note: the leading 0 is getting lost in the conversion to string
      data.slice(position, space).toString().padStart(6, "0")
    ); // File mode (permissions)
    const name = data.slice(space + 1, nullChar).toString(); // Entry name
    const sha = data.slice(nullChar + 1, nullChar + 21).toString("hex"); // SHA-1 hash

    const type = modeToObjectType(mode);

    position = nullChar + 21; // Move to the next entry

    if (options.recursive && type === "tree") {
      entries.push(...lsTree({ root, hash: sha, prefix: `${name}/` }, options));
    } else {
      const entry = options.nameOnly
        ? `${prefix}${name}`
        : `${mode} ${type} ${sha} ${prefix}${name}`;
      entries.push(entry);
    }
  }

  return entries;
}
