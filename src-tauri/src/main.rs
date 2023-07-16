use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#[tauri::command]
fn greet(name: &str) -> String {
  println!("[Native Call][greet]{:?}", name);
  format!("Hello, {}!", name)
}

// Custom struct to represent file information
#[derive(Serialize)]
struct FileInfo {
  name: String,
  is_directory: bool,
  path: PathBuf,
}

impl FileInfo {
  fn new(name: String, is_directory: bool, path: PathBuf) -> Self {
    FileInfo {
      name,
      is_directory,
      path,
    }
  }
}

#[tauri::command]
fn get_directory_by_path(path: &str) -> Vec<FileInfo> {
  let mut file_info_list = Vec::new();

  if let Ok(entries) = fs::read_dir(path) {
    for entry in entries {
      if let Ok(entry) = entry {
        let file_path = entry.path();

        // 跳过隐藏文件
        if file_path.file_name().unwrap().to_str().unwrap().starts_with(".") {
          continue;
        }

        let name = file_path
          .file_name()
          .unwrap_or_else(|| Path::new("").as_os_str())
          .to_string_lossy()
          .to_string();

        let is_directory = file_path.is_dir();

        let absolute_path = file_path.canonicalize().unwrap_or(file_path);

        let file_info = FileInfo::new(name, is_directory, absolute_path);
        file_info_list.push(file_info);
      }
    }
  }

  file_info_list
}

#[tauri::command]
fn get_content_by_filepath(path: PathBuf) -> String {
  println!("[Native Call][get_content_by_filepath]{:?}", path);
  fs::read_to_string(path).unwrap()
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
            greet,
            get_content_by_filepath,
            get_directory_by_path
        ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
