export interface IDirectory {
  path: string;
  name: string;
  children?: IDirectory[];
}