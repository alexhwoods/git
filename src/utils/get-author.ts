import * as child_process from "child_process";

/**
 * Obviously this is cheating
 */
export function getAuthor(): { name: string; email: string } {
  const authorName = child_process
    .execSync(`git config user.name`)
    .toString()
    .trim();
  const authorEmail = child_process
    .execSync(`git config user.email`)
    .toString()
    .trim();

  return {
    name: authorName,
    email: authorEmail,
  };
}
