// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{
    api::process::{Command, CommandEvent},
    Manager,
};

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
                if file_path
                    .file_name()
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .starts_with(".")
                {
                    continue;
                }

                let name = file_path
                    .file_name()
                    .unwrap_or_else(|| Path::new("").as_os_str())
                    .to_string_lossy()
                    .to_string();

                let is_directory = file_path.is_dir();
                let absolute_path = file_path.clone();

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

#[tauri::command]
fn write_string_to_file(path: PathBuf, content: String) {
    println!("[Native Call][保存内容到文件]{:?}", path);
    fs::write(path, content).unwrap()
}

#[tauri::command]
fn create_markdown_file_to_path(path: PathBuf) -> PathBuf {
    println!(
        "[Native Call][create_markdown_file_to_path]{:?}",
        path.to_str()
    );
    // 默认文件名为 untitled.md 存在则自动加上数字后缀
    let mut file_name = String::from("untitled.md");
    let mut file_path = path.clone().join(file_name.clone());
    let mut index = 0;
    while file_path.exists() {
        index += 1;
        file_name = format!("untitled{}.md", index);
        file_path = path.join(file_name.clone());
    }
    fs::write(file_path.clone(), "").unwrap();
    file_path
}

// 创建目录
#[tauri::command]
fn create_directory_to_path(path: PathBuf) -> PathBuf {
    println!("[Native Call][create_directory_to_path]{:?}", path);
    // 默认文件名为 untitled.md 存在则自动加上数字后缀
    let mut file_name = String::from("untitled");
    let mut file_path = path.clone().join(file_name.clone());
    let mut index = 0;
    while file_path.exists() {
        index += 1;
        file_name = format!("新建文件夹{}", index);
        file_path = path.join(file_name.clone());
    }
    fs::create_dir(file_path.clone()).unwrap();
    file_path
}

// 修改文件名
#[tauri::command]
fn rename_file_by_path(old_path: PathBuf, new_path: PathBuf) -> PathBuf {
    println!(
        "[Native Call][rename_file_by_path] old_path:{:?}, new_path:{:?}",
        old_path, new_path
    );
    // 如果修改的文件名已存在则自动加上数字后缀
    let file_name = new_path
        .file_name()
        .unwrap_or_else(|| Path::new("").as_os_str())
        .to_string_lossy()
        .to_string();
    let mut file_path = new_path.clone();
    let mut index = 0;
    while file_path.exists() {
        index += 1;
        let suffix = Path::new(&file_name).extension().unwrap().to_str().unwrap();
        // 去掉文件后缀
        let mut file_name = file_name.replace(format!(".{}", suffix).as_str(), "");
        file_name = format!("{}({})", file_name, index);
        file_name = format!("{}.{}", file_name, suffix);
        file_path = new_path.parent().unwrap().join(file_name.clone());
    }
    fs::rename(old_path.clone(), file_path.clone()).expect("rename file error");
    println!(
        "[Native Call][rename_file_by_path] old_path:{:?}, new_path:{:?}",
        old_path, file_path
    );
    file_path
}

// 删除指定路径的文件
#[tauri::command]
fn remove_file_by_path(path: PathBuf) {
    println!("[Native Call][remove_file_by_path] path:{:?}", path);
    fs::remove_file(path).expect("remove file error");
}

// 删除指定路径的文件夹
#[tauri::command]
fn remove_directory_by_path(path: PathBuf) {
    println!("[Native Call][remove_directory_by_path] path:{:?}", path);
    fs::remove_dir_all(path).expect("remove directory error");
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            tauri::async_runtime::spawn(async move {
                let (mut rx, mut child) = Command::new_sidecar("demo")
                    .expect("failed to setup `app` sidecar")
                    .spawn()
                    .expect("Failed to spawn packaged node");

                let mut i = 0;
                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line) = event {
                        // window
                        //     .emit("message", Some(format!("'{}'", line)))
                        //     .expect("failed to emit event");
                        // i += 1;
                        if i == 4 {
                            child.write("message from Rust\n".as_bytes()).unwrap();
                            i = 0;
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            get_content_by_filepath,
            write_string_to_file,
            get_directory_by_path,
            create_markdown_file_to_path,
            create_directory_to_path,
            rename_file_by_path,
            remove_file_by_path,
            remove_directory_by_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
