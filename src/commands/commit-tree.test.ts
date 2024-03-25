import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import crypto from "crypto";
import * as child_process from "child_process";

import { writeTree } from "./write-tree";
import { commitTree } from "./commit-tree";
import { getAuthor } from "../utils/get-author";

describe("commit-tree", () => {
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

    const gitCommitTreeResult = child_process
      .execSync(
        `cd ${tempDir} && git commit-tree ${writeTreeResult} -m "Initial commit"`
      )
      .toString()
      .trim();

    const showCommitResult = child_process
      .execSync(`cd ${tempDir} && git show ${commitTreeResult}`)
      .toString();

    const showGitCommitResult = child_process
      .execSync(`cd ${tempDir} && git show ${gitCommitTreeResult}`)
      .toString();

    // Assert
    expect(
      showCommitResult.replace(commitTreeResult, "pretend-hash")
    ).toContain(
      showGitCommitResult.replace(gitCommitTreeResult, "pretend-hash")
    );
  });

  test("single file added - deep in a directory", () => {
    // Arrange
    const tempDir = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString("hex")
    );
    child_process.execSync(`mkdir ${tempDir}`);
    child_process.execSync(`mkdir ${path.join(tempDir, "dir")}`);
    child_process.execSync(`cd ${tempDir} && git init`);
    fs.writeFileSync(path.join(tempDir, "dir", "hello.txt"), "Hello, World!");
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

    const gitCommitTreeResult = child_process
      .execSync(
        `cd ${tempDir} && git commit-tree ${writeTreeResult} -m "Initial commit"`
      )
      .toString()
      .trim();

    const showCommitResult = child_process
      .execSync(`cd ${tempDir} && git show ${commitTreeResult}`)
      .toString();

    const showGitCommitResult = child_process
      .execSync(`cd ${tempDir} && git show ${gitCommitTreeResult}`)
      .toString();

    // Assert
    expect(
      showCommitResult.replace(commitTreeResult, "pretend-hash")
    ).toContain(
      showGitCommitResult.replace(gitCommitTreeResult, "pretend-hash")
    );
  });

  test("multiple files added", () => {
    // Arrange
    const tempDir = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString("hex")
    );
    child_process.execSync(`mkdir ${tempDir}`);
    child_process.execSync(`cd ${tempDir} && git init`);

    const dir = "baseball";
    child_process.execSync(`mkdir ${path.join(tempDir, dir)}`);
    const football = "football";
    child_process.execSync(`mkdir ${path.join(tempDir, football)}`);

    child_process.execSync(`cd ${tempDir} && git init`);
    fs.writeFileSync(path.join(tempDir, dir, "hello.txt"), "hello");
    fs.writeFileSync(path.join(tempDir, football, "world.txt"), "world");
    fs.writeFileSync(path.join(tempDir, "a.txt"), "a");
    fs.writeFileSync(path.join(tempDir, "b.txt"), "b");
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

    const gitCommitTreeResult = child_process
      .execSync(
        `cd ${tempDir} && git commit-tree ${writeTreeResult} -m "Initial commit"`
      )
      .toString()
      .trim();

    const showCommitResult = child_process
      .execSync(`cd ${tempDir} && git show ${commitTreeResult}`)
      .toString();

    const showGitCommitResult = child_process
      .execSync(`cd ${tempDir} && git show ${gitCommitTreeResult}`)
      .toString();

    // Assert
    expect(
      showCommitResult.replace(commitTreeResult, "pretend-hash")
    ).toContain(
      showGitCommitResult.replace(gitCommitTreeResult, "pretend-hash")
    );
  });

  test("with a parent commit", () => {
    // Arrange
    const tempDir = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString("hex")
    );
    child_process.execSync(`mkdir ${tempDir}`);
    child_process.execSync(`cd ${tempDir} && git init`);
    fs.writeFileSync(path.join(tempDir, "hello.txt"), "Hello, World!");
    child_process.execSync(`cd ${tempDir} && git add .`);

    child_process
      .execSync(`cd ${tempDir} && git commit -m "Initial commit"`)
      .toString()
      .trim();

    const commit = child_process
      .execSync(`cd ${tempDir} && git rev-parse HEAD`)
      .toString()
      .trim();

    fs.writeFileSync(path.join(tempDir, "hello.txt"), "Hello, World! 2");
    child_process.execSync(`cd ${tempDir} && git add .`);

    const author = getAuthor();

    // Act
    const writeTreeResult = writeTree({
      root: tempDir,
    });

    const commitTreeResult = commitTree({
      root: tempDir,
      tree: writeTreeResult,
      parent: commit,
      message: "Update hello",
      author,
    });

    const gitCommitTreeResult = child_process
      .execSync(
        `cd ${tempDir} && git commit-tree ${writeTreeResult} -p ${commit} -m "Update hello"`
      )
      .toString()
      .trim();

    const showCommitResult = child_process
      .execSync(`cd ${tempDir} && git show ${commitTreeResult}`)
      .toString();

    const showGitCommitResult = child_process
      .execSync(`cd ${tempDir} && git show ${gitCommitTreeResult}`)
      .toString();

    // Assert
    expect(
      showCommitResult.replace(commitTreeResult, "pretend-hash")
    ).toContain(
      showGitCommitResult.replace(gitCommitTreeResult, "pretend-hash")
    );
  });
});
