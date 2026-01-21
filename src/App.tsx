import { useState } from "react";
import { AsymmetricCryptoPanel } from "./components/AsymmetricCryptoPanel";
import { SymmetricCryptoPanel } from "./components/SymmetricCryptoPanel";
import { TabButton } from "./components/TabButton";
import "./App.css";

type TabId = "symmetric" | "asymmetric";

const tabs: { id: TabId; label: string }[] = [
  { id: "symmetric", label: "Symmetric Crypto" },
  { id: "asymmetric", label: "Asymmetric Crypto" },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("symmetric");

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Crypto Desktop</p>
          <h1>Cryptography Toolkit</h1>
          <p className="subtitle">
            Explore symmetric encryption and asymmetric workflows powered by Tauri
            commands.
          </p>
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="Crypto options">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            isActive={activeTab === tab.id}
            onClick={(id) => setActiveTab(id as TabId)}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>

      <div className="panel-container">
        {activeTab === "symmetric" ? <SymmetricCryptoPanel /> : <AsymmetricCryptoPanel />}
      </div>
    </main>
  );
}

export default App;
