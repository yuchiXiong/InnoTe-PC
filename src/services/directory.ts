import baseRequest from "./base-request";

export interface IDirectory {
  path: string;
  name: string;
  children?: IDirectory[];
}

export const getDirectory = (): Promise<IDirectory> => {
  return baseRequest<IDirectory>("http://127.0.0.1:5501/markdown.json")
}

export const getFile = (path: string): Promise<string> => {
  return fetch(`http://127.0.0.1:5501/${path}`)
    .then((response) => response.text()) as Promise<string>;
}