import fs from "fs";
import path from "path";

import { modeSchema } from "../types";
import { hashObject } from "./hash-object";

export type IndexEntry = {
  mode: string;
  sha: string;
  stage: number;
  name: string;
};

// https://git-scm.com/docs/index-format
export function lsFilesInternal(
  { root }: { root: string },
  options: {
    cached?: boolean;
    modified?: boolean;
    stage?: boolean;
    deleted?: boolean;
  } = {
    stage: false,
    cached: false,
    modified: false,
    deleted: false,
  }
): IndexEntry[] {
  const indexExists = fs.existsSync(path.join(root, ".git", "index"));

  if (!indexExists) {
    return [];
  }

  const data = fs.readFileSync(path.join(root, ".git", "index"), null);

  // get the first 12 bytes
  let position = 0;
  const signature = data.subarray(position, position + 4).toString();
  position += 4;

  const version = data.readUInt32BE(position);
  position += 4;

  const numEntries = data.readUInt32BE(position);
  position += 4;

  let currentEntry = 1;

  const entries: IndexEntry[] = [];

  while (currentEntry <= numEntries) {
    // while (currentEntry <= numEntries) {
    const cTimeSeconds = data.readUInt32BE(position);
    position += 4;
    position += 4; // skip ctime nanosecond fraction

    const mTimeSeconds = data.readUInt32BE(position);
    position += 4;
    position += 4; // skip mtime nanosecond fraction

    position += 4; // skip dev
    position += 4; // skip ino

    // mode
    const modeBits = data.readUInt32BE(position);
    const modeNumber = modeBits & 0xffff;
    const mode = modeSchema.parse(modeNumber.toString(8).padStart(6, "0"));
    position += 4;

    // object type and unix permissions are giving problems, move on
    position += 2;

    position += 4; // skip uid
    position += 4; // skip gid
    position += 2; // skip size

    const sha = data.subarray(position, position + 20).toString("hex");
    position += 20;

    const nameLengthBits = data.readUInt16BE(position);
    const stage = nameLengthBits & 0b0011000000000000;
    const nameLength = nameLengthBits & 0xfff;
    position += 2;

    const name = data.subarray(position, position + nameLength).toString();
    position += nameLength;

    // null padding
    while (data[position] === 0) {
      position++;
    }

    const entry = options.stage ? `${mode} ${sha} ${stage}\t${name}` : name;

    const filepath = path.join(root, name);
    if (options.deleted) {
      const exists = fs.existsSync(filepath);

      if (!exists) {
        entries.push({ mode, sha, stage, name });
      }
    } else if (options.modified) {
      // unstaged deletion counts as a modification
      const exists = fs.existsSync(filepath);

      if (exists) {
        const stats = fs.statSync(filepath);
        const mtime = stats.mtimeMs / 1000;

        if (mtime > mTimeSeconds) {
          const hash = hashObject({
            root: root,
            filename: filepath,
          });

          if (hash !== sha) {
            entries.push({ mode, sha, stage, name });
          }
        }
      } else {
        entries.push({ mode, sha, stage, name });
      }
    } else {
      entries.push({ mode, sha, stage, name });
    }

    currentEntry++;
  }

  return entries;
}
export function lsFiles(
  { root }: { root: string },
  options: {
    cached?: boolean;
    modified?: boolean;
    stage?: boolean;
    deleted?: boolean;
  } = {
    stage: false,
    cached: false,
    modified: false,
    deleted: false,
  }
): string[] {
  const entries = lsFilesInternal({ root }, options);

  if (options.stage) {
    return entries.map(
      (entry) => `${entry.mode} ${entry.sha} ${entry.stage}\t${entry.name}`
    );
  }

  return entries.map((entry) => entry.name);
}
