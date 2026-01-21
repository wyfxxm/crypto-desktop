// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            crypto_desktop_lib::greet,
            crypto_desktop_lib::ping
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
