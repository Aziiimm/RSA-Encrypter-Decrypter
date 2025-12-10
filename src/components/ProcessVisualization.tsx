import { type ProcessStep } from '../utils/rsa';

interface ProcessVisualizationProps {
  mode: 'encrypt' | 'decrypt';
  steps: ProcessStep[];
  isProcessing: boolean;
}

export default function ProcessVisualization({
  mode,
  steps,
  isProcessing,
}: ProcessVisualizationProps) {
  if (!isProcessing && steps.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {mode === 'encrypt' ? 'Encryption Process' : 'Decryption Process'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {mode === 'encrypt'
            ? 'The encryption process will be shown here when you encrypt a message.'
            : 'The decryption process will be shown here when you decrypt a ciphertext.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {mode === 'encrypt' ? 'Encryption Process' : 'Decryption Process'}
      </h3>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.step}
            className={`relative pl-8 pb-4 ${
              index < steps.length - 1 ? 'border-l-2 border-gray-200 dark:border-gray-700' : ''
            }`}
          >
            {/* Step indicator */}
            <div
              className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : step.status === 'active'
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}
            >
              {step.status === 'completed' ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step.step
              )}
            </div>

            {/* Step content */}
            <div
              className={`transition-all duration-300 ${
                step.status === 'active'
                  ? 'opacity-100 scale-100'
                  : step.status === 'completed'
                    ? 'opacity-100'
                    : 'opacity-60'
              }`}
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {step.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {step.description}
              </p>
              {step.value && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                    {step.value.length > 100
                      ? `${step.value.substring(0, 100)}...`
                      : step.value}
                  </p>
                </div>
              )}
              {step.details && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {step.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {isProcessing && (
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <svg
            className="animate-spin h-4 w-4"
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
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}

