import baseRequest from "./base-request";

export interface IDirectory {
  path: string;
  name: string;
  children?: IDirectory[];
}

export const getDirectory = (): Promise<IDirectory> => {
  return baseRequest<IDirectory>("http://127.0.0.1:5500/markdown.json")
}