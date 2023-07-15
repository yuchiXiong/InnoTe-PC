import { invoke } from '@tauri-apps/api/tauri';

export default function greet(name: string): Promise<string> {
  return invoke<string>('greet', { name });
}