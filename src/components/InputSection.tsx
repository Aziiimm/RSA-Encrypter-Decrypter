interface InputSectionProps {
  value: string;
  onChange: (value: string) => void;
  mode: 'encrypt' | 'decrypt';
  onModeChange: (mode: 'encrypt' | 'decrypt') => void;
  onProcess: () => void;
  isProcessing: boolean;
  hasKeys: boolean;
}

export default function InputSection({
  value,
  onChange,
  mode,
  onModeChange,
  onProcess,
  isProcessing,
  hasKeys
}: InputSectionProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </h2>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onModeChange('encrypt')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              mode === 'encrypt'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Encrypt
          </button>
          <button
            onClick={() => onModeChange('decrypt')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              mode === 'decrypt'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Decrypt
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {mode === 'encrypt' ? 'Plaintext' : 'Ciphertext (Base64)'}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={mode === 'encrypt' ? 'Enter your message to encrypt...' : 'Enter ciphertext to decrypt...'}
          className="flex-1 w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          disabled={isProcessing}
        />
        
        <button
          onClick={onProcess}
          disabled={!hasKeys || !value.trim() || isProcessing}
          className="mt-4 w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{mode === 'encrypt' ? 'Encrypting...' : 'Decrypting...'}</span>
            </>
          ) : (
            <span>{mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</span>
          )}
        </button>
        
        {!hasKeys && (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            ⚠️ Please generate keys first
          </p>
        )}
      </div>
    </div>
  );
}

