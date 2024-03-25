import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import crypto from "crypto";
import * as child_process from "child_process";

import { writeTree } from "./write-tree";

describe("write-tree", () => {
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

    // Act
    const writeTreeResult = writeTree({
      root: tempDir,
    });

    // Assure the git version is the same
    const gitWriteTreeResult = child_process
      .execSync(`cd ${tempDir} && git write-tree`)
      .toString()
      .trim();

    expect(writeTreeResult).toBe(gitWriteTreeResult);

    const gitLsTreeResult = child_process
      .execSync(`cd ${tempDir} && git ls-tree ${gitWriteTreeResult}`)
      .toString();

    // Assert
    expect(gitLsTreeResult).toBeDefined();
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

    // Act
    const writeTreeResult = writeTree({
      root: tempDir,
    });

    const lsTreeResult = child_process
      .execSync(`cd ${tempDir} && git ls-tree ${writeTreeResult}`)
      .toString();

    const gitWriteTreeResult = child_process
      .execSync(`cd ${tempDir} && git write-tree`)
      .toString()
      .trim();

    const gitLsTreeResult = child_process
      .execSync(`cd ${tempDir} && git ls-tree ${gitWriteTreeResult}`)
      .toString();

    // Assert
    // git write-tree and writeTree will each generate their own tree,
    // so we need to check the there equal
    expect(lsTreeResult).toBe(gitLsTreeResult);
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

    // Act
    const writeTreeResult = writeTree({
      root: tempDir,
    });
    const lsTreeResult = child_process
      .execSync(`cd ${tempDir} && git ls-tree ${writeTreeResult}`)
      .toString();

    const gitWriteTreeResult = child_process
      .execSync(`cd ${tempDir} && git write-tree`)
      .toString()
      .trim();

    const gitLsTreeResult = child_process
      .execSync(`cd ${tempDir} && git ls-tree ${gitWriteTreeResult}`)
      .toString();

    // Assert
    expect(lsTreeResult).toBe(gitLsTreeResult);
  });
});
