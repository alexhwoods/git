import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import crypto from "crypto";
import * as child_process from "child_process";

import { lsFiles } from "./ls-files";

describe("ls-files", () => {
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
    const lsFilesResult = lsFiles({
      root: tempDir,
    });

    const gitLsFiles = child_process
      .execSync(`cd ${tempDir} && git ls-files`)
      .toString()
      .trim();

    // Assert
    expect(lsFilesResult.join("\n")).toBe(gitLsFiles);
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
    const lsFilesResult = lsFiles({
      root: tempDir,
    });

    const gitLsFiles = child_process
      .execSync(`cd ${tempDir} && git ls-files`)
      .toString()
      .trim();

    // Assert
    expect(lsFilesResult.join("\n")).toBe(gitLsFiles);
  });

  test("multiple files added", () => {
    // Arrange
    const tempDir = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString("hex")
    );
    child_process.execSync(`mkdir ${tempDir}`);
    child_process.execSync(`cd ${tempDir} && git init`);

    fs.writeFileSync(path.join(tempDir, "a.txt"), "Hello, World!");
    fs.writeFileSync(path.join(tempDir, "b.txt"), "Hello, World!");
    child_process.execSync(`cd ${tempDir} && git add .`);

    // Act
    const lsFilesResult = lsFiles({
      root: tempDir,
    });

    const gitLsFiles = child_process
      .execSync(`cd ${tempDir} && git ls-files`)
      .toString()
      .trim();

    // Assert
    expect(lsFilesResult.join("\n")).toBe(gitLsFiles);
  });

  test("only modified files", () => {
    // Arrange
    const tempDir = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString("hex")
    );
    child_process.execSync(`mkdir ${tempDir}`);
    child_process.execSync(`cd ${tempDir} && git init`);

    fs.writeFileSync(path.join(tempDir, "a.txt"), "Hello, World!");
    fs.writeFileSync(path.join(tempDir, "b.txt"), "Hello, World!");
    child_process.execSync(`cd ${tempDir} && git add .`);
    child_process.execSync(`cd ${tempDir} && git commit -m 'Initial commit'`);

    fs.writeFileSync(path.join(tempDir, "a.txt"), "Hello, World! Modified");

    // Act
    const lsFilesResult = lsFiles(
      {
        root: tempDir,
      },
      {
        modified: true,
      }
    );

    const gitLsFiles = child_process
      .execSync(`cd ${tempDir} && git ls-files --modified`)
      .toString()
      .trim();

    // Assert
    expect(lsFilesResult.join("\n")).toBe(gitLsFiles);
  });

  test("only deleted files", () => {
    // Arrange
    const tempDir = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString("hex")
    );
    child_process.execSync(`mkdir ${tempDir}`);
    child_process.execSync(`cd ${tempDir} && git init`);

    fs.writeFileSync(path.join(tempDir, "a.txt"), "Hello, World!");
    fs.writeFileSync(path.join(tempDir, "b.txt"), "Hello, World!");
    child_process.execSync(`cd ${tempDir} && git add .`);
    child_process.execSync(`cd ${tempDir} && git commit -m 'Initial commit'`);

    // delete a file
    fs.unlinkSync(path.join(tempDir, "a.txt"));

    // Act
    const lsFilesResult = lsFiles(
      {
        root: tempDir,
      },
      {
        deleted: true,
      }
    );

    const gitLsFiles = child_process
      .execSync(`cd ${tempDir} && git ls-files --deleted`)
      .toString()
      .trim();

    // Assert
    expect(lsFilesResult.join("\n")).toBe(gitLsFiles);
  });
});
