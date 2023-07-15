use std::fs;
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn greet(name: &str) -> String {
  println!("[Native Call][greet]{:?}", name);
  format!("Hello, {}!", name)
}

// #[tauri::command]
// fn get_directory_by_path() -> Result<Vec<fs::DirEntry>, io::Error> {
//   let mut entries = fs::read_dir("D:/code//wolai_export/markdown")?
//     .map(|res| res.map(|e| e.path()))
//     .collect::<Result<Vec<_>, io::Error>>()?;

//   entries.sort();

//   entries
// }

#[tauri::command]
fn get_content_by_filepath(path: std::path::PathBuf) -> String {
  println!("[Native Call][get_content_by_filepath]{:?}", path);
  fs::read_to_string(path).unwrap()
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet, get_content_by_filepath])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
