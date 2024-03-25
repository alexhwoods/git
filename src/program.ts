import { Command } from "commander";
import { init } from "./commands/init";
import { catFile } from "./commands/cat-file";
import { hashObject } from "./commands/hash-object";
import { lsTree } from "./commands/ls-tree";
import { lsFiles } from "./commands/ls-files";
import { writeTree } from "./commands/write-tree";
import { commitTree } from "./commands/commit-tree";
import { getAuthor } from "./utils/get-author";

const program = new Command();

program.command("init").action(() => init(__dirname));

program
  .command("cat-file")
  .arguments("<hash>")
  .option("-p, --pretty", "Pretty print")
  .action((hash) => {
    const contents = catFile({
      root: process.cwd(),
      hash: hash,
    });

    process.stdout.write(contents);
  });

// @note: opting not to support --type
// To create trees, use git write-tree
// To create commits, use git commit-tree
program
  .command("hash-object")
  .arguments("<filename>")
  .option("-w, --write", "Write object to disk")
  .action((filename, options) => {
    const hash = hashObject(
      {
        root: process.cwd(),
        filename: filename,
      },
      options
    );

    process.stdout.write(hash);
  });

program
  .command("ls-tree")
  .arguments("<hash>")
  .option("-n, --name-only", "List only filenames")
  .option("-r, --recursive", "Recursively list all files in tree")
  .action((hash, options) => {
    const contents = lsTree(
      {
        root: process.cwd(),
        hash: hash,
      },
      options
    );

    process.stdout.write(contents.join("\n"));
  });

program
  .command("ls-files")
  .option(
    "-s, --stage",
    "Show staged contents' mode bits, object name and stage number in the output."
  )
  .option("-d, --deleted", "Show files with an unstaged deletion")
  .option(
    "-m, --modified",
    "Show files with an unstaged modification (note that an unstaged deletion also counts as an unstaged modification)"
  )
  .option(
    "-c, --cached",
    "Show all files cached in Git's index, i.e. all tracked files. (This is the default if no -c/-s/-d/-o/-u/-k/-m/--resolve-undo options are specified.)"
  )
  .action((options) => {
    const entries = lsFiles(
      {
        root: process.cwd(),
      },
      options
    );

    process.stdout.write(entries.join("\n"));
  });

program.command("write-tree").action(() => {
  const hash = writeTree({
    root: process.cwd(),
  });

  process.stdout.write(hash);
});

program
  .command("commit-tree")
  .argument("<tree>", "Tree hash")
  .option("-m, --message <message>", "Commit message")
  .option("-p, --parent <parent>", "Parent commit hash")
  .action((tree, options) => {
    const date = new Date().toISOString();
    const author = getAuthor();
    const commit = commitTree({
      root: process.cwd(),
      tree: tree,
      message: options.message,
      date,
      author,
    });

    process.stdout.write(commit);
  });

export { program };
