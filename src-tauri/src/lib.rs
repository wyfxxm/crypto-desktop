// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn ping() -> &'static str {
    "pong"
}

#[tauri::command]
pub fn aes_encrypt(plaintext: &str, key: &str, nonce: &str) -> Result<String, String> {
    let key_bytes = key.as_bytes();
    if key_bytes.len() != 32 {
        return Err("Key must be 32 bytes for AES-256-GCM.".to_string());
    }

    let nonce_bytes = nonce.as_bytes();
    if nonce_bytes.len() != 12 {
        return Err("Nonce must be 12 bytes for AES-GCM.".to_string());
    }

    let cipher = Aes256Gcm::new_from_slice(key_bytes)
        .map_err(|error| format!("Invalid key length: {error}"))?;
    let nonce = Nonce::from_slice(nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|error| format!("Encryption failed: {error}"))?;

    Ok(STANDARD.encode(ciphertext))
}

#[tauri::command]
pub fn aes_decrypt(ciphertext_b64: &str, key: &str, nonce: &str) -> Result<String, String> {
    let key_bytes = key.as_bytes();
    if key_bytes.len() != 32 {
        return Err("Key must be 32 bytes for AES-256-GCM.".to_string());
    }

    let nonce_bytes = nonce.as_bytes();
    if nonce_bytes.len() != 12 {
        return Err("Nonce must be 12 bytes for AES-GCM.".to_string());
    }

    let cipher = Aes256Gcm::new_from_slice(key_bytes)
        .map_err(|error| format!("Invalid key length: {error}"))?;
    let nonce = Nonce::from_slice(nonce_bytes);
    let ciphertext = STANDARD
        .decode(ciphertext_b64)
        .map_err(|error| format!("Invalid base64 ciphertext: {error}"))?;

    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|error| format!("Decryption failed: {error}"))?;

    String::from_utf8(plaintext).map_err(|error| format!("Invalid UTF-8 plaintext: {error}"))
}
