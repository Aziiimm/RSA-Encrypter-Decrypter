interface OutputSectionProps {
  value: string;
  mode: 'encrypt' | 'decrypt';
}

export default function OutputSection({ value, mode }: OutputSectionProps) {
  const copyToClipboard = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      console.log('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {mode === 'encrypt' ? 'Ciphertext' : 'Plaintext'}
        </h2>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            {mode === 'encrypt' ? 'Encrypted Output (Base64)' : 'Decrypted Output'}
          </label>
          {value && (
            <button
              onClick={copyToClipboard}
              className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded transition-colors"
            >
              Copy
            </button>
          )}
        </div>
        <textarea
          readOnly
          value={value || (mode === 'encrypt' ? 'Encrypted text will appear here...' : 'Decrypted text will appear here...')}
          className="flex-1 w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm text-gray-800 dark:text-gray-200 resize-none focus:outline-none"
          placeholder={mode === 'encrypt' ? 'Encrypted text will appear here...' : 'Decrypted text will appear here...'}
        />
      </div>
    </div>
  );
}

