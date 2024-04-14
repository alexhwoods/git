import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import crypto from "crypto";
import * as child_process from "child_process";

import { add } from "./add";
import { hashObject } from "./hash-object";

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

    // Act
    // call git update-index --add hello.txt
    const lsFilesResultBefore = child_process
      .execSync(`cd ${tempDir} && git ls-files --stage`)
      .toString();

    console.log(lsFilesResultBefore);
    child_process.execSync(`cd ${tempDir} && git add hello.txt`);

    // call git ls-files --stage
    const lsFilesResult = child_process
      .execSync(`cd ${tempDir} && git ls-files --stage`)
      .toString();

    console.log(lsFilesResult);
    // updateIndex(
    //   {
    //     root: tempDir,
    //     cacheInfo: {
    //       mode: "100644",
    //       hash: "b1946ac92492d2347c6235b4d2611184",
    //       path: "hello.txt",
    //     },
    //   },
    //   { add: true }
    // );

    // Assert
  });
});
