import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface StatusMessage {
  tone: "success" | "error";
  message: string;
}

export function SymmetricCryptoPanel() {
  const [plaintext, setPlaintext] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [key, setKey] = useState("");
  const [nonce, setNonce] = useState("");
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [result, setResult] = useState("");

  const handleEncrypt = async () => {
    setStatus(null);
    try {
      const encrypted = await invoke<string>("aes_encrypt", {
        plaintext,
        key,
        nonce,
      });
      setCiphertext(encrypted);
      setResult(encrypted);
      setStatus({ tone: "success", message: "Encrypted successfully." });
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleDecrypt = async () => {
    setStatus(null);
    try {
      const decrypted = await invoke<string>("aes_decrypt", {
        ciphertext_b64: ciphertext,
        key,
        nonce,
      });
      setResult(decrypted);
      setStatus({ tone: "success", message: "Decrypted successfully." });
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <section
      className="panel"
      id="symmetric-panel"
      role="tabpanel"
      aria-labelledby="symmetric-tab"
    >
      <h2>Symmetric Crypto</h2>
      <p className="panel-description">
        AES-256-GCM encryption requires a 32-byte key and 12-byte nonce.
      </p>

      <div className="field-grid">
        <label className="field">
          <span>Plaintext</span>
          <textarea
            value={plaintext}
            onChange={(event) => setPlaintext(event.target.value)}
            placeholder="Enter message to encrypt"
            rows={4}
          />
        </label>
        <label className="field">
          <span>Ciphertext (base64)</span>
          <textarea
            value={ciphertext}
            onChange={(event) => setCiphertext(event.target.value)}
            placeholder="Paste ciphertext to decrypt"
            rows={4}
          />
        </label>
        <label className="field">
          <span>Key (32 bytes)</span>
          <input
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="32-character key"
          />
        </label>
        <label className="field">
          <span>Nonce (12 bytes)</span>
          <input
            value={nonce}
            onChange={(event) => setNonce(event.target.value)}
            placeholder="12-character nonce"
          />
        </label>
      </div>

      <div className="button-row">
        <button type="button" onClick={handleEncrypt}>
          Encrypt
        </button>
        <button type="button" onClick={handleDecrypt}>
          Decrypt
        </button>
      </div>

      <div className="result-block">
        <h3>Result</h3>
        <pre>{result || "No result yet."}</pre>
      </div>

      {status && (
        <div
          className={
            status.tone === "error" ? "status status--error" : "status status--success"
          }
          role={status.tone === "error" ? "alert" : "status"}
        >
          {status.message}
        </div>
      )}
    </section>
  );
}
