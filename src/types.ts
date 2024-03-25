import * as z from "zod";

export enum Mode {
  RegularFile = "100644",
  ExecutableFile = "100755",
  SymbolicLink = "120000",
  Directory = "040000",
}

export const modeSchema = z.nativeEnum(Mode);

export enum ObjectType {
  Blob = "blob",
  Tree = "tree",
}

export function modeToObjectType(mode: Mode): ObjectType {
  switch (mode) {
    case Mode.RegularFile:
    case Mode.ExecutableFile:
    case Mode.SymbolicLink:
      return ObjectType.Blob;
    case Mode.Directory:
      return ObjectType.Tree;
  }
}
