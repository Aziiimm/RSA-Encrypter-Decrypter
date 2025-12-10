import { useState } from "react";
import { generateKeyPair, formatKeyPEM, type RSAKeyPair } from "../utils/rsa";

interface KeyGeneratorProps {
  onKeysGenerated: (keys: RSAKeyPair) => void;
}

type KeySize = 8 | 2048;

export default function KeyGenerator({ onKeysGenerated }: KeyGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [publicKeyPEM, setPublicKeyPEM] = useState<string>("");
  const [privateKeyPEM, setPrivateKeyPEM] = useState<string>("");
  const [keys, setKeys] = useState<RSAKeyPair | null>(null);
  const [keySize, setKeySize] = useState<KeySize>(2048);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPublicKeyPEM("");
    setPrivateKeyPEM("");

    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      try {
        const keyPair = generateKeyPair(keySize);
        const publicPEM = formatKeyPEM(keyPair.publicKey, false);
        const privatePEM = formatKeyPEM(keyPair.privateKey, true);

        setKeys(keyPair);
        setPublicKeyPEM(publicPEM);
        setPrivateKeyPEM(privatePEM);
        onKeysGenerated(keyPair);
      } catch (error) {
        console.error("Key generation error:", error);
      } finally {
        setIsGenerating(false);
      }
    }, 10);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Visual feedback could be added here
        console.log(`${type} copied to clipboard`);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  const getKeySizeLabel = (size: KeySize): string => {
    switch (size) {
      case 8:
        return "8-bit (Teaching: n=6)";
      case 2048:
        return "2048-bit (Secure)";
      default:
        return `${size}-bit`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        RSA Key Generator
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Key Size
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setKeySize(8)}
            disabled={isGenerating}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              keySize === 8
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            8-bit
            <span className="block text-xs mt-0.5 opacity-90">Ex. (n=6)</span>
          </button>
          <button
            type="button"
            onClick={() => setKeySize(2048)}
            disabled={isGenerating}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              keySize === 2048
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            2048-bit
            <span className="block text-xs mt-0.5 opacity-90">Secure</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {keySize === 8
            ? "⚠️ Keys are very small and NOT secure. For demonstration only."
            : "✓ Secure key size recommended for actual use."}
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Generating Keys ({getKeySizeLabel(keySize)})...</span>
          </>
        ) : (
          <span>Generate New Key Pair</span>
        )}
      </button>

      {publicKeyPEM && keys && (
        <div className="mt-6 space-y-4">
          {/* Show key values for teaching mode - only if keys are actually small */}
          {keys.publicKey.n < 100n && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-blue-700 dark:text-blue-300 font-mono">
                    <strong>n (modulus):</strong> {keys.publicKey.n.toString()}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 font-mono">
                    <strong>e (public exp):</strong>{" "}
                    {keys.publicKey.e.toString()}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 dark:text-blue-300 font-mono">
                    <strong>d (private exp):</strong>{" "}
                    {keys.privateKey.d.toString()}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                    n = p × q, where p and q are primes
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Public Key
              </label>
              <button
                onClick={() => copyToClipboard(publicKeyPEM, "Public key")}
                className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={publicKeyPEM}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-xs text-gray-800 dark:text-gray-200 resize-none"
              rows={keySize === 8 ? 4 : 6}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Private Key
              </label>
              <button
                onClick={() => copyToClipboard(privateKeyPEM, "Private key")}
                className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={privateKeyPEM}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-xs text-gray-800 dark:text-gray-200 resize-none"
              rows={keySize === 8 ? 4 : 6}
            />
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              ⚠️ Keep your private key secure and never share it!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
