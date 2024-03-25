import fs from "fs";
import path from "path";
import crypto from "crypto";
import zlib from "zlib";

import { Mode } from "../types";
import { IndexEntry, lsFilesInternal } from "./ls-files";

/**
 * Note - This function will write a tree compatible to one that get would write.
 * But there are slight differences that I haven't figured out yet, which result in a different hash.
 *
 * I suspect it has something to do with extensions.
 */
export function writeTree({ root }: { root: string }): string {
  const indexedFiles = lsFilesInternal({ root });
  const indexedFilesMap = indexedFiles.reduce((acc, file) => {
    acc[file.name] = file;
    return acc;
  }, {} as Record<string, IndexEntry>);

  function writeTreeRecursive({
    directory,
    basePath = "",
    root = directory,
  }: {
    directory: string;
    basePath?: string;
    root?: string;
  }): string {
    const files = fs.readdirSync(directory).filter((file) => file !== ".git");

    const children: GitTreeEntry[] = [];
    for (const file of files) {
      const filePath = path.join(directory, file);

      if (fs.statSync(filePath).isDirectory()) {
        const tree = writeTreeRecursive({
          basePath: path.join(basePath, file),
          directory: filePath,
          root,
        });

        children.push({
          mode: Mode.Directory,
          path: file,
          sha: tree,
        });
      } else {
        const value = path.relative(root, filePath);

        if (indexedFilesMap[value] != null) {
          const indexEntry = indexedFilesMap[value];

          children.push({
            mode: indexEntry.mode,
            path: file,
            sha: indexEntry.sha,
          });
        }
      }
    }

    const { sha1, store } = createGitTree(children);

    fs.mkdirSync(path.join(root, ".git", "objects", sha1.slice(0, 2)), {
      recursive: true,
    });

    fs.writeFileSync(
      path.join(root, ".git", "objects", sha1.slice(0, 2), sha1.slice(2)),
      zlib.deflateSync(store)
    );

    return sha1;
  }

  return writeTreeRecursive({ directory: root });
}

interface GitTreeEntry {
  mode: string;
  path: string;
  sha: string;
}

/**
 * Encodes a single tree entry in the Git tree object format.
 */
function encodeTreeEntry(entry: GitTreeEntry): Buffer {
  const modePathBuffer = Buffer.from(`${entry.mode} ${entry.path}\x00`);
  const shaBuffer = Buffer.from(entry.sha, "hex"); // SHA is expected to be in binary form, so we convert from hex
  return Buffer.concat([modePathBuffer, shaBuffer]);
}

/**
 * Creates a Git tree object from entries and calculates its SHA-1 hash.
 */
function createGitTree(entries: GitTreeEntry[]): {
  sha1: string;
  store: Buffer;
} {
  // Concatenate all entries
  const treeContent = Buffer.concat(entries.map(encodeTreeEntry));

  // Create the tree header
  const length = treeContent.length;

  const header = `tree ${length}\x00`;
  const store = Buffer.concat([Buffer.from(header, "utf8"), treeContent]);

  // Calculate SHA-1 hash
  const sha1 = crypto.createHash("sha1").update(store).digest("hex");
  return { sha1, store };
}
