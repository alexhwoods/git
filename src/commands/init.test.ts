import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { init } from "./init";

test("init", () => {
  // Arrange
  const tempDir = path.join(os.tmpdir(), "myTempFolder");

  // Act
  init(tempDir);

  // Assert
  const gitDir = path.join(tempDir, ".git");
  expect(fs.existsSync(gitDir)).toBe(true);
});
