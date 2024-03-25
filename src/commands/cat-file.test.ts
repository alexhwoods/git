import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { hashObject } from "./hash-object";
import { catFile } from "./cat-file";

test("cat-file", () => {
  // Arrange
  const tempDir = path.join(os.tmpdir(), "myTempFolder");
  const filename = path.join(tempDir, "hello.txt");
  const content = "Hello, World!";
  fs.writeFileSync(path.join(tempDir, "hello.txt"), content);

  // Act
  const hash = hashObject(
    {
      root: tempDir,
      filename,
    },
    { write: true }
  );

  const result = catFile({
    root: tempDir,
    hash,
  });

  // Assert
  expect(result).toBe(content);
});
