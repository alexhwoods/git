import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import crypto from "crypto";
import * as child_process from "child_process";

import { hashObject } from "./hash-object";

describe("hash-object", () => {
  test("hash a single file", () => {
    // Arrange
    const tempDir = path.join(os.tmpdir(), "myTempFolder");
    const filename = path.join(tempDir, "hello.txt");
    const content = "Hello, World!";
    fs.writeFileSync(filename, content);

    // Act
    const hash = hashObject({
      root: tempDir,
      filename,
    });

    const gitHash = child_process
      .execSync(`git hash-object ${filename}`)
      .toString()
      .trim();

    // Assert
    expect(hash).toBe(gitHash);
  });

  test("single file in a directory", () => {
    // Arrange
    const tempDir = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString("hex")
    );
    child_process.execSync(`mkdir ${tempDir}`);
    child_process.execSync(`cd ${tempDir} && git init`);

    child_process.execSync(`mkdir ${tempDir}/teams`);

    const filename = path.join(tempDir, "teams", "braves.txt");
    fs.writeFileSync(filename, "Hello, World!");
    child_process.execSync(`cd ${tempDir} && git add .`);

    // Act
    const hash = hashObject({
      root: tempDir,
      filename,
    });

    const gitHash = child_process
      .execSync(`git hash-object ${filename}`)
      .toString()
      .trim();

    // Assert
    expect(hash).toBe(gitHash);
  });
});
