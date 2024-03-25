import fs from "fs";
import path from "path";

export function init(root: string) {
  fs.mkdirSync(path.join(root, ".git"), { recursive: true });
  fs.mkdirSync(path.join(root, ".git", "objects"), { recursive: true });
  fs.mkdirSync(path.join(root, ".git", "refs"), { recursive: true });

  fs.writeFileSync(path.join(root, ".git", "HEAD"), "ref: refs/heads/main\n");

  if (process.env.NODE_ENV !== "test") {
    console.log("Initialized git directory");
  }
}
