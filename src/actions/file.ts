import { invoke } from '@tauri-apps/api/tauri';

const getFileContent = (path: string): Promise<string> => {
  return invoke<string>('get_content_by_filepath', { path });
}

export {
  getFileContent
}