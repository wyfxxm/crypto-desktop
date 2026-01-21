// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use rand::rngs::OsRng;
use rsa::pkcs1::{DecodeRsaPrivateKey, DecodeRsaPublicKey, EncodeRsaPrivateKey, EncodeRsaPublicKey};
use rsa::{Oaep, RsaPrivateKey, RsaPublicKey};
use serde::Serialize;
use sha2::Sha256;

#[derive(Serialize)]
pub struct KeyPair {
    pub public_key: String,
    pub private_key: String,
}
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

#[tauri::command]
pub fn rsa_generate_keypair(bits: usize) -> Result<KeyPair, String> {
    let mut rng = OsRng;
    let private_key =
        RsaPrivateKey::new(&mut rng, bits).map_err(|error| format!("RSA keygen failed: {error}"))?;
    let public_key = RsaPublicKey::from(&private_key);

    let private_key_der = private_key
        .to_pkcs1_der()
        .map_err(|error| format!("RSA private key export failed: {error}"))?;
    let public_key_der = public_key
        .to_pkcs1_der()
        .map_err(|error| format!("RSA public key export failed: {error}"))?;

    Ok(KeyPair {
        public_key: STANDARD.encode(public_key_der.as_bytes()),
        private_key: STANDARD.encode(private_key_der.as_bytes()),
    })
}

#[tauri::command]
pub fn rsa_encrypt(plaintext: &str, public_key_b64: &str) -> Result<String, String> {
    let public_key_bytes = STANDARD
        .decode(public_key_b64)
        .map_err(|error| format!("Invalid base64 public key: {error}"))?;
    let public_key = RsaPublicKey::from_pkcs1_der(&public_key_bytes)
        .map_err(|error| format!("Invalid RSA public key: {error}"))?;

    let mut rng = OsRng;
    let padding = Oaep::new::<Sha256>();
    let ciphertext = public_key
        .encrypt(&mut rng, padding, plaintext.as_bytes())
        .map_err(|error| format!("RSA encryption failed: {error}"))?;

    Ok(STANDARD.encode(ciphertext))
}

#[tauri::command]
pub fn rsa_decrypt(ciphertext_b64: &str, private_key_b64: &str) -> Result<String, String> {
    let private_key_bytes = STANDARD
        .decode(private_key_b64)
        .map_err(|error| format!("Invalid base64 private key: {error}"))?;
    let private_key = RsaPrivateKey::from_pkcs1_der(&private_key_bytes)
        .map_err(|error| format!("Invalid RSA private key: {error}"))?;
    let ciphertext = STANDARD
        .decode(ciphertext_b64)
        .map_err(|error| format!("Invalid base64 ciphertext: {error}"))?;

    let padding = Oaep::new::<Sha256>();
    let plaintext = private_key
        .decrypt(padding, &ciphertext)
        .map_err(|error| format!("RSA decryption failed: {error}"))?;

    String::from_utf8(plaintext).map_err(|error| format!("Invalid UTF-8 plaintext: {error}"))
}

#[tauri::command]
pub fn ed25519_generate_keypair() -> Result<KeyPair, String> {
    let mut rng = OsRng;
    let signing_key = SigningKey::generate(&mut rng);
    let verifying_key = signing_key.verifying_key();

    Ok(KeyPair {
        public_key: STANDARD.encode(verifying_key.to_bytes()),
        private_key: STANDARD.encode(signing_key.to_bytes()),
    })
}

#[tauri::command]
pub fn ed25519_sign(message: &str, private_key_b64: &str) -> Result<String, String> {
    let private_key_bytes = STANDARD
        .decode(private_key_b64)
        .map_err(|error| format!("Invalid base64 private key: {error}"))?;
    let signing_key = SigningKey::from_bytes(
        private_key_bytes
            .as_slice()
            .try_into()
            .map_err(|_| "Invalid Ed25519 private key length".to_string())?,
    );

    let signature = signing_key.sign(message.as_bytes());
    Ok(STANDARD.encode(signature.to_bytes()))
}

#[tauri::command]
pub fn ed25519_verify(
    message: &str,
    signature_b64: &str,
    public_key_b64: &str,
) -> Result<bool, String> {
    let public_key_bytes = STANDARD
        .decode(public_key_b64)
        .map_err(|error| format!("Invalid base64 public key: {error}"))?;
    let verifying_key = VerifyingKey::from_bytes(
        public_key_bytes
            .as_slice()
            .try_into()
            .map_err(|_| "Invalid Ed25519 public key length".to_string())?,
    )
    .map_err(|error| format!("Invalid Ed25519 public key: {error}"))?;

    let signature_bytes = STANDARD
        .decode(signature_b64)
        .map_err(|error| format!("Invalid base64 signature: {error}"))?;
    let signature = Signature::from_slice(&signature_bytes)
        .map_err(|error| format!("Invalid Ed25519 signature: {error}"))?;

    Ok(verifying_key
        .verify(message.as_bytes(), &signature)
        .is_ok())
}
