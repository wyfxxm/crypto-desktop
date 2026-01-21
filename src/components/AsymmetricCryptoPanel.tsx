import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface StatusMessage {
  tone: "success" | "error";
  message: string;
}

interface KeyPair {
  public_key: string;
  private_key: string;
}

export function AsymmetricCryptoPanel() {
  const [rsaBits, setRsaBits] = useState("2048");
  const [rsaPublicKey, setRsaPublicKey] = useState("");
  const [rsaPrivateKey, setRsaPrivateKey] = useState("");
  const [rsaPlaintext, setRsaPlaintext] = useState("");
  const [rsaCiphertext, setRsaCiphertext] = useState("");
  const [rsaResult, setRsaResult] = useState("");
  const [rsaStatus, setRsaStatus] = useState<StatusMessage | null>(null);

  const handleRsaKeygen = async () => {
    setRsaStatus(null);
    try {
      const keypair = await invoke<KeyPair>("rsa_generate_keypair", {
        bits: Number(rsaBits),
      });
      setRsaPublicKey(keypair.public_key);
      setRsaPrivateKey(keypair.private_key);
      setRsaStatus({ tone: "success", message: "RSA keypair generated." });
    } catch (error) {
      setRsaStatus({
        tone: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleRsaEncrypt = async () => {
    setRsaStatus(null);
    try {
      const encrypted = await invoke<string>("rsa_encrypt", {
        plaintext: rsaPlaintext,
        public_key_b64: rsaPublicKey,
      });
      setRsaCiphertext(encrypted);
      setRsaResult(encrypted);
      setRsaStatus({ tone: "success", message: "RSA encryption complete." });
    } catch (error) {
      setRsaStatus({
        tone: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleRsaDecrypt = async () => {
    setRsaStatus(null);
    try {
      const decrypted = await invoke<string>("rsa_decrypt", {
        ciphertext_b64: rsaCiphertext,
        private_key_b64: rsaPrivateKey,
      });
      setRsaResult(decrypted);
      setRsaStatus({ tone: "success", message: "RSA decryption complete." });
    } catch (error) {
      setRsaStatus({
        tone: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };


  return (
    <section
      className="panel"
      id="asymmetric-panel"
      role="tabpanel"
      aria-labelledby="asymmetric-tab"
    >
      <h2>Asymmetric Crypto</h2>
      <p className="panel-description">Use RSA for encryption/decryption.</p>

      <div className="card">
        <div className="card-header">
          <h3>RSA Encryption</h3>
        </div>
        <div className="field-grid">
          <label className="field">
            <span>Key size (bits)</span>
            <input
              value={rsaBits}
              onChange={(event) => setRsaBits(event.target.value)}
              placeholder="2048"
            />
          </label>
          <div className="button-row button-row--align-start">
            <button type="button" onClick={handleRsaKeygen}>
              Generate Keypair
            </button>
          </div>
          <label className="field field--full">
            <span>Public key (base64)</span>
            <textarea
              value={rsaPublicKey}
              onChange={(event) => setRsaPublicKey(event.target.value)}
              rows={3}
            />
          </label>
          <label className="field field--full">
            <span>Private key (base64)</span>
            <textarea
              value={rsaPrivateKey}
              onChange={(event) => setRsaPrivateKey(event.target.value)}
              rows={3}
            />
          </label>
          <label className="field field--full">
            <span>Plaintext</span>
            <textarea
              value={rsaPlaintext}
              onChange={(event) => setRsaPlaintext(event.target.value)}
              rows={3}
            />
          </label>
          <label className="field field--full">
            <span>Ciphertext (base64)</span>
            <textarea
              value={rsaCiphertext}
              onChange={(event) => setRsaCiphertext(event.target.value)}
              rows={3}
            />
          </label>
        </div>
        <div className="button-row">
          <button type="button" onClick={handleRsaEncrypt}>
            Encrypt
          </button>
          <button type="button" onClick={handleRsaDecrypt}>
            Decrypt
          </button>
        </div>
        <div className="result-block">
          <h4>Result</h4>
          <pre>{rsaResult || "No RSA output yet."}</pre>
        </div>
        {rsaStatus && (
          <div
            className={
              rsaStatus.tone === "error" ? "status status--error" : "status status--success"
            }
            role={rsaStatus.tone === "error" ? "alert" : "status"}
          >
            {rsaStatus.message}
          </div>
        )}
      </div>

    </section>
  );
}
