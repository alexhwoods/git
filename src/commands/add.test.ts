import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import crypto from "crypto";
import * as child_process from "child_process";

import { add } from "./add";

describe("add", () => {
  test("single file added", () => {
    // Arrange
    const tempDir = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString("hex")
    );
    child_process.execSync(`mkdir ${tempDir}`);
    child_process.execSync(`cd ${tempDir} && git init`);
    const filename = path.join(tempDir, "hello.txt");
    const content = "Hello, World!";
    fs.writeFileSync(filename, content);

    // Get comparison ls files
    child_process.execSync(`cd ${tempDir} && git add hello.txt`);
    const lsFilesFromActualGit = child_process
      .execSync(`cd ${tempDir} && git ls-files --stage`)
      .toString();
    child_process.execSync(`cd ${tempDir} && git reset hello.txt`).toString();

    // Act
    add({ root: tempDir, paths: ["hello.txt"] });

    const lsFilesResultAfterAdd = child_process
      .execSync(`cd ${tempDir} && git ls-files --stage`)
      .toString();

    // Assert
    expect(lsFilesResultAfterAdd).toEqual(lsFilesFromActualGit);
  });

  test("single file added - staging area already populated", () => {
    // Arrange
    const tempDir = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString("hex")
    );
    child_process.execSync(`mkdir ${tempDir}`);
    child_process.execSync(`cd ${tempDir} && git init`);
    fs.writeFileSync(path.join(tempDir, "exists-already.txt"), "Old news");
    child_process.execSync(`cd ${tempDir} && git add exists-already.txt`);

    const filename = path.join(tempDir, "hello.txt");
    const content = "Hello, World!";
    fs.writeFileSync(filename, content);

    // Get comparison ls files
    child_process.execSync(`cd ${tempDir} && git add hello.txt`);
    const lsFilesFromActualGit = child_process
      .execSync(`cd ${tempDir} && git ls-files --stage`)
      .toString();
    child_process.execSync(`cd ${tempDir} && git reset hello.txt`).toString();

    // Act
    add({ root: tempDir, paths: ["hello.txt"] });

    const lsFilesResultAfterAdd = child_process
      .execSync(`cd ${tempDir} && git ls-files --stage`)
      .toString();

    // Assert
    expect(lsFilesResultAfterAdd).toEqual(lsFilesFromActualGit);
  });

  test("single file added - staging area already populated (with directories too)", () => {
    // Arrange
    const tempDir = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString("hex")
    );
    child_process.execSync(`mkdir ${tempDir}`);
    child_process.execSync(`cd ${tempDir} && git init`);
    child_process.execSync(`cd ${tempDir} && mkdir -p a/b/c`);
    fs.writeFileSync(
      path.join(tempDir, "a", "b", "c", "exists-already.txt"),
      "Old news"
    );
    child_process.execSync(`cd ${tempDir} && git add a/b/c/exists-already.txt`);

    const filename = path.join(tempDir, "hello.txt");
    const content = "Hello, World!";
    fs.writeFileSync(filename, content);

    // Get comparison ls files
    child_process.execSync(`cd ${tempDir} && git add hello.txt`);
    const lsFilesFromActualGit = child_process
      .execSync(`cd ${tempDir} && git ls-files --stage`)
      .toString();
    child_process.execSync(`cd ${tempDir} && git reset hello.txt`).toString();

    // Act
    add({ root: tempDir, paths: ["hello.txt"] });

    const lsFilesResultAfterAdd = child_process
      .execSync(`cd ${tempDir} && git ls-files --stage`)
      .toString();

    // Assert
    expect(lsFilesResultAfterAdd).toEqual(lsFilesFromActualGit);
  });
});
