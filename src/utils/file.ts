import { IDirectory } from "@/services/directory";

const isDirectory = (file: IDirectory) => {
  return 'children' in file;
}

export const fileComparable = (a: IDirectory, b: IDirectory) => {
  return Number(isDirectory(b)) - Number(isDirectory(a));
}