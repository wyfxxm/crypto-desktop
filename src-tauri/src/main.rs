// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            crypto_desktop_lib::greet,
            crypto_desktop_lib::ping,
            crypto_desktop_lib::aes_encrypt,
            crypto_desktop_lib::aes_decrypt,
            crypto_desktop_lib::rsa_generate_keypair,
            crypto_desktop_lib::rsa_encrypt,
            crypto_desktop_lib::rsa_decrypt,
            crypto_desktop_lib::ed25519_generate_keypair,
            crypto_desktop_lib::ed25519_sign,
            crypto_desktop_lib::ed25519_verify
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
