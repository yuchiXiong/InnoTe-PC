import { invoke } from '@tauri-apps/api/tauri';

const getFileContent = (path: string): Promise<string> => {
  return invoke<string>('get_content_by_filepath', { path });
}

export interface IDirectoryContent {
  name: string;
  path: string;
  isDirectory: boolean;
}

type TNativeDirectoryContent = Exclude<IDirectoryContent, 'isDirectory'> & { is_directory: boolean };

const getDirectoryContent = (path: string): Promise<IDirectoryContent[]> => {
  return invoke<TNativeDirectoryContent[]>('get_directory_by_path', { path }).then(data => {
    return data.map(item => {
      return {
        name: item.name,
        path: item.path,
        isDirectory: item.is_directory
      }
    })
  })
}

const writeFile = (path: string, content: string): Promise<void> => {
  return invoke<void>('write_string_to_file', { path, content });
}

const createFile = (path: string): Promise<void> => {
  return invoke<void>('create_markdown_file_to_path', { path });
}

export {
  getFileContent,
  getDirectoryContent,
  writeFile,
  createFile
}