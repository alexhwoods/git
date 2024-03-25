import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import crypto from "crypto";
import * as child_process from "child_process";

import { writeTree } from "./write-tree";
import { commitTree } from "./commit-tree";
import { getAuthor } from "../utils/get-author";

describe.skip("commit", () => {
  test("single file added", () => {
    // Arrange
    const tempDir = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString("hex")
    );
    child_process.execSync(`mkdir ${tempDir}`);
    child_process.execSync(`cd ${tempDir} && git init`);
    fs.writeFileSync(path.join(tempDir, "hello.txt"), "Hello, World!");
    child_process.execSync(`cd ${tempDir} && git add .`);

    const author = getAuthor();

    // Act
    const writeTreeResult = writeTree({
      root: tempDir,
    });

    const commitTreeResult = commitTree({
      root: tempDir,
      tree: writeTreeResult,
      message: "Initial commit",
      author,
    });

    const showCommitResult = child_process
      .execSync(`cd ${tempDir} && git show ${commitTreeResult}`)
      .toString();

    console.log(showCommitResult);
  });
});
