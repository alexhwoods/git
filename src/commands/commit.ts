import fs from "fs";
import path from "path";
import { writeTree } from "./write-tree";
import { commitTree } from "./commit-tree";

export function commit({
  root,
  message = null,
}: {
  root: string;
  message?: string | null;
}): string {
  if (message == null) {
    throw new Error("Aborting commit due to empty commit message.");
  }

  const parent = fs
    .readFileSync(path.join(root, ".git", "HEAD"), "utf-8")
    .trim();

  const tree = writeTree({
    root,
  });

  return commitTree({
    root,
    tree,
    message,
    parent,
  });
}
