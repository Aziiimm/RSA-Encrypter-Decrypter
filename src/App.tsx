import { useState } from "react";
import "./App.css";
import KeyGenerator from "./components/KeyGenerator";
import InputSection from "./components/InputSection";
import OutputSection from "./components/OutputSection";
import ErrorDisplay from "./components/ErrorDisplay";
import ProcessVisualization from "./components/ProcessVisualization";
import {
  encryptWithProcess,
  decryptWithProcess,
  type RSAKeyPair,
  type ProcessStep,
} from "./utils/rsa";

function App() {
  const [keys, setKeys] = useState<RSAKeyPair | null>(null);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);

  const handleKeysGenerated = (newKeys: RSAKeyPair) => {
    setKeys(newKeys);
    setError(null);
    setOutputText("");
  };

  const handleProcess = () => {
    if (!keys || !inputText.trim()) {
      return;
    }

    setError(null);
    setIsProcessing(true);
    setOutputText("");
    setProcessSteps([]);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        if (mode === "encrypt") {
          const ciphertext = encryptWithProcess(
            inputText,
            keys.publicKey,
            (step) => {
              setProcessSteps((prev) => {
                const updated = [...prev];
                // Mark previous steps as completed
                updated.forEach((s) => {
                  if (s.status === "active") s.status = "completed";
                });
                updated.push(step);
                return updated;
              });
            }
          );
          setOutputText(ciphertext);
        } else {
          const plaintext = decryptWithProcess(
            inputText,
            keys.privateKey,
            (step) => {
              setProcessSteps((prev) => {
                const updated = [...prev];
                // Mark previous steps as completed
                updated.forEach((s) => {
                  if (s.status === "active") s.status = "completed";
                });
                updated.push(step);
                return updated;
              });
            }
          );
          setOutputText(plaintext);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(
          `Failed to ${mode}: ${errorMessage}. Please check your input and try again.`
        );
        setOutputText("");
        setProcessSteps([]);
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            RSA Encryption & Decryption
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Custom 2048-bit RSA Encryption and Decryption
          </p>
        </header>

        <div className="mb-6">
          <KeyGenerator onKeysGenerated={handleKeysGenerated} />
        </div>

        <ErrorDisplay error={error} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <InputSection
              value={inputText}
              onChange={setInputText}
              mode={mode}
              onModeChange={setMode}
              onProcess={handleProcess}
              isProcessing={isProcessing}
              hasKeys={!!keys}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <OutputSection value={outputText} mode={mode} />
          </div>
        </div>

        <ProcessVisualization
          mode={mode}
          steps={processSteps}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}

export default App;
