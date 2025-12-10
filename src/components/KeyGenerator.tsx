import { useState } from 'react';
import { generateKeyPair, formatKeyPEM, type RSAKeyPair } from '../utils/rsa';

interface KeyGeneratorProps {
  onKeysGenerated: (keys: RSAKeyPair) => void;
}

export default function KeyGenerator({ onKeysGenerated }: KeyGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [publicKeyPEM, setPublicKeyPEM] = useState<string>('');
  const [privateKeyPEM, setPrivateKeyPEM] = useState<string>('');
  const [keys, setKeys] = useState<RSAKeyPair | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPublicKeyPEM('');
    setPrivateKeyPEM('');
    
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      try {
        const keyPair = generateKeyPair();
        const publicPEM = formatKeyPEM(keyPair.publicKey, false);
        const privatePEM = formatKeyPEM(keyPair.privateKey, true);
        
        setKeys(keyPair);
        setPublicKeyPEM(publicPEM);
        setPrivateKeyPEM(privatePEM);
        onKeysGenerated(keyPair);
      } catch (error) {
        console.error('Key generation error:', error);
      } finally {
        setIsGenerating(false);
      }
    }, 10);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Visual feedback could be added here
      console.log(`${type} copied to clipboard`);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        RSA Key Generator
      </h2>
      
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating Keys (2048-bit)...</span>
          </>
        ) : (
          <span>Generate New Key Pair</span>
        )}
      </button>

      {publicKeyPEM && (
        <div className="mt-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Public Key
              </label>
              <button
                onClick={() => copyToClipboard(publicKeyPEM, 'Public key')}
                className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded transition-colors"
              >
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={publicKeyPEM}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-xs text-gray-800 dark:text-gray-200 resize-none"
              rows={6}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Private Key
              </label>
              <button
                onClick={() => copyToClipboard(privateKeyPEM, 'Private key')}
                className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded transition-colors"
              >
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={privateKeyPEM}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-xs text-gray-800 dark:text-gray-200 resize-none"
              rows={6}
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

