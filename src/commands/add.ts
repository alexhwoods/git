export function add({ root, paths }: { root: string; paths: string[] }) {
  // @todo: so, editing the index file is not so easy eh
  /**
   * 1. For each path:
   *  a. Call hash-object - this will create the object if it doesn't exist
   *  b. Get the SHA-1 hash
   *  c. Write the entry to the index file
   *
   * It's this step 1c that's a pain, because the index file is a binary file.
   *
   * To peer into it's complexities, see the ls-files.ts file.
   */
}
