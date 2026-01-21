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

  const [edMessage, setEdMessage] = useState("");
  const [edPublicKey, setEdPublicKey] = useState("");
  const [edPrivateKey, setEdPrivateKey] = useState("");
  const [edSignature, setEdSignature] = useState("");
  const [edVerification, setEdVerification] = useState("Not verified yet");
  const [edStatus, setEdStatus] = useState<StatusMessage | null>(null);

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

  const handleEdKeygen = async () => {
    setEdStatus(null);
    try {
      const keypair = await invoke<KeyPair>("ed25519_generate_keypair");
      setEdPublicKey(keypair.public_key);
      setEdPrivateKey(keypair.private_key);
      setEdStatus({ tone: "success", message: "Ed25519 keypair generated." });
    } catch (error) {
      setEdStatus({
        tone: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleEdSign = async () => {
    setEdStatus(null);
    try {
      const signature = await invoke<string>("ed25519_sign", {
        message: edMessage,
        private_key_b64: edPrivateKey,
      });
      setEdSignature(signature);
      setEdStatus({ tone: "success", message: "Message signed." });
    } catch (error) {
      setEdStatus({
        tone: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleEdVerify = async () => {
    setEdStatus(null);
    try {
      const verified = await invoke<boolean>("ed25519_verify", {
        message: edMessage,
        signature_b64: edSignature,
        public_key_b64: edPublicKey,
      });
      setEdVerification(verified ? "Signature verified." : "Signature invalid.");
      setEdStatus({ tone: "success", message: "Verification complete." });
    } catch (error) {
      setEdStatus({
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
      <p className="panel-description">
        Use RSA for encryption/decryption and Ed25519 for signing and verification.
      </p>

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

      <div className="card">
        <div className="card-header">
          <h3>Ed25519 Signatures</h3>
        </div>
        <div className="field-grid">
          <div className="button-row button-row--align-start">
            <button type="button" onClick={handleEdKeygen}>
              Generate Keypair
            </button>
          </div>
          <label className="field field--full">
            <span>Public key (base64)</span>
            <textarea
              value={edPublicKey}
              onChange={(event) => setEdPublicKey(event.target.value)}
              rows={3}
            />
          </label>
          <label className="field field--full">
            <span>Private key (base64)</span>
            <textarea
              value={edPrivateKey}
              onChange={(event) => setEdPrivateKey(event.target.value)}
              rows={3}
            />
          </label>
          <label className="field field--full">
            <span>Message</span>
            <textarea
              value={edMessage}
              onChange={(event) => setEdMessage(event.target.value)}
              rows={3}
            />
          </label>
          <label className="field field--full">
            <span>Signature (base64)</span>
            <textarea
              value={edSignature}
              onChange={(event) => setEdSignature(event.target.value)}
              rows={3}
            />
          </label>
        </div>
        <div className="button-row">
          <button type="button" onClick={handleEdSign}>
            Sign
          </button>
          <button type="button" onClick={handleEdVerify}>
            Verify
          </button>
        </div>
        <div className="result-block">
          <h4>Verification</h4>
          <pre>{edVerification}</pre>
        </div>
        {edStatus && (
          <div
            className={
              edStatus.tone === "error" ? "status status--error" : "status status--success"
            }
            role={edStatus.tone === "error" ? "alert" : "status"}
          >
            {edStatus.message}
          </div>
        )}
      </div>
    </section>
  );
}
