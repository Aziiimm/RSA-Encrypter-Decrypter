// RSA Key Pair Types
export interface RSAKeyPair {
  publicKey: {
    n: bigint;
    e: bigint;
  };
  privateKey: {
    n: bigint;
    d: bigint;
  };
}

// Process step for visualization
export interface ProcessStep {
  step: number;
  name: string;
  description: string;
  status: "pending" | "active" | "completed";
  value?: string;
  details?: string;
}

// Generate a random big integer in a range
function randomBigInt(min: bigint, max: bigint): bigint {
  const range = max - min;
  const bits = range.toString(2).length;
  let result: bigint;

  do {
    const randomBytes = new Uint8Array(Math.ceil(bits / 8));
    crypto.getRandomValues(randomBytes);
    result = BigInt(
      "0x" +
        Array.from(randomBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
    );
  } while (result > range);

  return result + min;
}

// Fast modular exponentiation: (base^exp) % mod
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = base % mod;

  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp >> 1n;
    base = (base * base) % mod;
  }

  return result;
}

// Miller-Rabin primality test
function isProbablyPrime(n: bigint, k: number = 10): boolean {
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n || n < 2n) return false;

  // Write n-1 as d * 2^r
  let d = n - 1n;
  let r = 0n;
  while (d % 2n === 0n) {
    d = d / 2n;
    r = r + 1n;
  }

  // Witness loop
  for (let i = 0; i < k; i++) {
    const a = randomBigInt(2n, n - 2n);
    let x = modPow(a, d, n);

    if (x === 1n || x === n - 1n) continue;

    let composite = true;
    for (let j = 0n; j < r - 1n; j++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }

    if (composite) return false;
  }

  return true;
}

// Generate a large prime number
function generateLargePrime(bits: number): bigint {
  const min = 2n ** BigInt(bits - 1);
  const max = 2n ** BigInt(bits) - 1n;

  while (true) {
    const candidate = randomBigInt(min, max);
    // Ensure it's odd
    const oddCandidate = candidate | 1n;
    if (isProbablyPrime(oddCandidate)) {
      return oddCandidate;
    }
  }
}

// Extended Euclidean Algorithm to find modular inverse
function modInverse(a: bigint, m: bigint): bigint {
  if (m === 1n) return 1n;

  let [oldR, r] = [a, m];
  let [oldS, s] = [1n, 0n];

  while (r !== 0n) {
    const quotient = oldR / r;
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
  }

  if (oldR > 1n) {
    throw new Error("Modular inverse does not exist");
  }

  return oldS < 0n ? oldS + m : oldS;
}

// Generate RSA key pair (2048-bit)
export function generateKeyPair(): RSAKeyPair {
  // Generate two 1024-bit primes
  const p = generateLargePrime(1024);
  const q = generateLargePrime(1024);

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  // Public exponent (commonly 65537)
  const e = 65537n;

  // Private exponent
  const d = modInverse(e, phi);

  return {
    publicKey: { n, e },
    privateKey: { n, d },
  };
}

// Get maximum message size for a given key
function getMaxMessageSize(n: bigint): number {
  // Key size in bytes
  const keySizeBytes = Math.ceil(n.toString(2).length / 8);
  // Leave room for padding: 0x00 0x02 [at least 8 random bytes] 0x00 [message]
  // Minimum padding overhead is 11 bytes
  const maxBytes = keySizeBytes - 11;
  return Math.max(1, maxBytes);
}

// Simple PKCS#1 v1.5 style padding (for educational purposes)
function padMessage(message: bigint, keySizeBytes: number): bigint {
  // Format: 0x00 0x02 [random non-zero bytes] 0x00 [message]
  const messageBytes = bigIntToBytes(
    message,
    Math.ceil(message.toString(2).length / 8)
  );
  const messageSize = messageBytes.length;
  const paddingSize = keySizeBytes - messageSize - 3; // 3 = 0x00 + 0x02 + 0x00

  if (paddingSize < 8) {
    throw new Error("Message too large for key size");
  }

  // Generate random non-zero padding bytes
  const paddingBytes = new Uint8Array(paddingSize);
  crypto.getRandomValues(paddingBytes);
  // Ensure all padding bytes are non-zero
  for (let i = 0; i < paddingBytes.length; i++) {
    while (paddingBytes[i] === 0) {
      paddingBytes[i] = Math.floor(Math.random() * 255) + 1;
    }
  }

  // Construct padded message: 0x00 0x02 [padding] 0x00 [message]
  const paddedBytes = new Uint8Array(keySizeBytes);
  paddedBytes[0] = 0x00;
  paddedBytes[1] = 0x02;
  paddedBytes.set(paddingBytes, 2);
  paddedBytes[2 + paddingSize] = 0x00;
  paddedBytes.set(messageBytes, 3 + paddingSize);

  return bytesToBigInt(paddedBytes);
}

// Remove padding
function unpadMessage(padded: bigint, keySizeBytes: number): bigint {
  const bytes = bigIntToBytes(padded, keySizeBytes);

  // Check format: must start with 0x00 0x02
  if (bytes[0] !== 0x00 || bytes[1] !== 0x02) {
    throw new Error("Invalid padding format");
  }

  // Find the 0x00 separator after padding
  let separatorIndex = -1;
  for (let i = 2; i < bytes.length; i++) {
    if (bytes[i] === 0x00) {
      separatorIndex = i;
      break;
    }
  }

  if (separatorIndex === -1 || separatorIndex < 10) {
    throw new Error(
      "Invalid padding: insufficient padding or missing separator"
    );
  }

  // Extract message bytes
  const messageBytes = bytes.slice(separatorIndex + 1);
  return bytesToBigInt(messageBytes);
}

// Encrypt message using public key
export function encrypt(
  message: string,
  publicKey: { n: bigint; e: bigint }
): string {
  if (!message) {
    throw new Error("Message cannot be empty");
  }

  const maxChunkSize = getMaxMessageSize(publicKey.n);
  const messageBytes = new TextEncoder().encode(message);
  const chunks: string[] = [];

  // Split message into chunks
  // Calculate key size in bytes: ceil(bits / 8) to ensure we have enough bytes
  const keySizeBytes = Math.ceil(publicKey.n.toString(2).length / 8);
  for (let i = 0; i < messageBytes.length; i += maxChunkSize) {
    const chunk = messageBytes.slice(i, i + maxChunkSize);
    const chunkBigInt = bytesToBigInt(chunk);

    // Pad and encrypt
    const padded = padMessage(chunkBigInt, keySizeBytes);
    if (padded >= publicKey.n) {
      throw new Error("Padded message exceeds key modulus");
    }
    const encrypted = modPow(padded, publicKey.e, publicKey.n);

    // Convert to base64 - ensure we use exactly keySizeBytes
    const encryptedBytes = bigIntToBytes(encrypted, keySizeBytes);
    chunks.push(bytesToBase64(encryptedBytes));
  }

  return chunks.join(":");
}

// Encrypt with process tracking
export function encryptWithProcess(
  message: string,
  publicKey: { n: bigint; e: bigint },
  onStep?: (step: ProcessStep) => void
): string {
  const steps: ProcessStep[] = [];
  let currentStep = 0;

  const addStep = (
    name: string,
    description: string,
    status: "pending" | "active" | "completed",
    value?: string,
    details?: string
  ) => {
    currentStep++;
    const step: ProcessStep = {
      step: currentStep,
      name,
      description,
      status,
      value,
      details,
    };
    steps.push(step);
    if (onStep) onStep(step);
    return step;
  };

  if (!message) {
    throw new Error("Message cannot be empty");
  }

  addStep(
    "Input Message",
    "Reading the plaintext message",
    "active",
    message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    `Message length: ${message.length} characters`
  );

  const maxChunkSize = getMaxMessageSize(publicKey.n);
  const messageBytes = new TextEncoder().encode(message);
  const keySizeBytes = Math.ceil(publicKey.n.toString(2).length / 8);

  addStep(
    "Message Encoding",
    "Converting message to bytes",
    "active",
    `${messageBytes.length} bytes`,
    `Max chunk size: ${maxChunkSize} bytes`
  );

  const chunks: string[] = [];
  const totalChunks = Math.ceil(messageBytes.length / maxChunkSize);

  addStep(
    "Chunking",
    `Splitting message into ${totalChunks} chunk(s)`,
    "active",
    undefined,
    `Each chunk will be encrypted separately`
  );

  for (let i = 0; i < messageBytes.length; i += maxChunkSize) {
    const chunk = messageBytes.slice(i, i + maxChunkSize);
    const chunkBigInt = bytesToBigInt(chunk);

    addStep(
      `Padding Chunk ${Math.floor(i / maxChunkSize) + 1}`,
      "Adding PKCS#1 v1.5 padding for security",
      "active",
      undefined,
      `Chunk size: ${chunk.length} bytes → ${keySizeBytes} bytes after padding`
    );

    const padded = padMessage(chunkBigInt, keySizeBytes);
    if (padded >= publicKey.n) {
      throw new Error("Padded message exceeds key modulus");
    }

    addStep(
      `Encrypting Chunk ${Math.floor(i / maxChunkSize) + 1}`,
      "Performing modular exponentiation: c = m^e mod n",
      "active",
      undefined,
      `Using public key (e=${publicKey.e.toString()})`
    );

    const encrypted = modPow(padded, publicKey.e, publicKey.n);

    addStep(
      `Encoding Chunk ${Math.floor(i / maxChunkSize) + 1}`,
      "Converting encrypted data to Base64",
      "active",
      undefined,
      "Base64 encoding for safe text representation"
    );

    const encryptedBytes = bigIntToBytes(encrypted, keySizeBytes);
    chunks.push(bytesToBase64(encryptedBytes));
  }

  const result = chunks.join(":");

  addStep(
    "Complete",
    "Encryption finished successfully",
    "completed",
    result.substring(0, 100) + (result.length > 100 ? "..." : ""),
    `Total ciphertext length: ${result.length} characters`
  );

  return result;
}

// Decrypt ciphertext using private key
export function decrypt(
  ciphertext: string,
  privateKey: { n: bigint; d: bigint }
): string {
  if (!ciphertext) {
    throw new Error("Ciphertext cannot be empty");
  }

  const chunks = ciphertext.split(":");
  const decryptedChunks: string[] = [];

  // Calculate key size in bytes: must match encryption calculation
  const keySizeBytes = Math.ceil(privateKey.n.toString(2).length / 8);
  for (const chunk of chunks) {
    // Decode from base64
    let encryptedBytes = base64ToBytes(chunk);

    // Ensure we have exactly keySizeBytes (pad with leading zeros if needed)
    if (encryptedBytes.length < keySizeBytes) {
      const paddedBytes = new Uint8Array(keySizeBytes);
      paddedBytes.set(encryptedBytes, keySizeBytes - encryptedBytes.length);
      encryptedBytes = paddedBytes;
    } else if (encryptedBytes.length > keySizeBytes) {
      // Trim if somehow too large (shouldn't happen, but be safe)
      encryptedBytes = encryptedBytes.slice(-keySizeBytes);
    }

    const encrypted = bytesToBigInt(encryptedBytes);

    // Decrypt
    const padded = modPow(encrypted, privateKey.d, privateKey.n);
    const messageBigInt = unpadMessage(padded, keySizeBytes);

    // Convert back to bytes then string
    const messageBytes = bigIntToBytes(
      messageBigInt,
      Math.ceil(messageBigInt.toString(2).length / 8)
    );
    decryptedChunks.push(new TextDecoder().decode(messageBytes));
  }

  return decryptedChunks.join("");
}

// Decrypt with process tracking
export function decryptWithProcess(
  ciphertext: string,
  privateKey: { n: bigint; d: bigint },
  onStep?: (step: ProcessStep) => void
): string {
  const steps: ProcessStep[] = [];
  let currentStep = 0;

  const addStep = (
    name: string,
    description: string,
    status: "pending" | "active" | "completed",
    value?: string,
    details?: string
  ) => {
    currentStep++;
    const step: ProcessStep = {
      step: currentStep,
      name,
      description,
      status,
      value,
      details,
    };
    steps.push(step);
    if (onStep) onStep(step);
    return step;
  };

  if (!ciphertext) {
    throw new Error("Ciphertext cannot be empty");
  }

  addStep(
    "Input Ciphertext",
    "Reading the encrypted ciphertext",
    "active",
    ciphertext.substring(0, 50) + (ciphertext.length > 50 ? "..." : ""),
    `Ciphertext length: ${ciphertext.length} characters`
  );

  const chunks = ciphertext.split(":");
  const totalChunks = chunks.length;

  addStep(
    "Parsing Chunks",
    `Splitting ciphertext into ${totalChunks} chunk(s)`,
    "active",
    undefined,
    "Each chunk will be decrypted separately"
  );

  const keySizeBytes = Math.ceil(privateKey.n.toString(2).length / 8);
  const decryptedChunks: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    // Decode from base64
    let encryptedBytes = base64ToBytes(chunks[i]);

    // Ensure we have exactly keySizeBytes (pad with leading zeros if needed)
    if (encryptedBytes.length < keySizeBytes) {
      const paddedBytes = new Uint8Array(keySizeBytes);
      paddedBytes.set(encryptedBytes, keySizeBytes - encryptedBytes.length);
      encryptedBytes = paddedBytes;
    } else if (encryptedBytes.length > keySizeBytes) {
      // Trim if somehow too large (shouldn't happen, but be safe)
      encryptedBytes = encryptedBytes.slice(-keySizeBytes);
    }
    addStep(
      `Decoding Chunk ${i + 1}`,
      "Converting Base64 to bytes",
      "active",
      undefined,
      "Base64 decoding"
    );

    const encrypted = bytesToBigInt(encryptedBytes);

    addStep(
      `Decrypting Chunk ${i + 1}`,
      "Performing modular exponentiation: m = c^d mod n",
      "active",
      undefined,
      `Using private key`
    );

    const padded = modPow(encrypted, privateKey.d, privateKey.n);

    addStep(
      `Removing Padding Chunk ${i + 1}`,
      "Removing PKCS#1 v1.5 padding",
      "active",
      undefined,
      "Extracting original message from padded data"
    );

    const messageBigInt = unpadMessage(padded, keySizeBytes);

    addStep(
      `Decoding Chunk ${i + 1}`,
      "Converting bytes back to text",
      "active",
      undefined,
      "Text decoding"
    );

    const messageBytes = bigIntToBytes(
      messageBigInt,
      Math.ceil(messageBigInt.toString(2).length / 8)
    );
    decryptedChunks.push(new TextDecoder().decode(messageBytes));
  }

  const result = decryptedChunks.join("");

  addStep(
    "Complete",
    "Decryption finished successfully",
    "completed",
    result.substring(0, 50) + (result.length > 50 ? "..." : ""),
    `Decrypted message length: ${result.length} characters`
  );

  return result;
}

// Convert bigint to byte array
function bigIntToBytes(num: bigint, byteLength: number): Uint8Array {
  const bytes = new Uint8Array(byteLength);
  let temp = num;
  for (let i = byteLength - 1; i >= 0; i--) {
    bytes[i] = Number(temp % 256n);
    temp = temp / 256n;
  }
  return bytes;
}

// Convert byte array to bigint
function bytesToBigInt(bytes: Uint8Array): bigint {
  let result = 0n;
  for (let i = 0; i < bytes.length; i++) {
    result = result * 256n + BigInt(bytes[i]);
  }
  return result;
}

// Base64 encoding
function bytesToBase64(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    ""
  );
  return btoa(binary);
}

// Base64 decoding
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  return new Uint8Array(Array.from(binary, (char) => char.charCodeAt(0)));
}

// Format key as PEM
export function formatKeyPEM(
  key: { n: bigint; e?: bigint; d?: bigint },
  isPrivate: boolean
): string {
  const keyType = isPrivate ? "RSA PRIVATE KEY" : "RSA PUBLIC KEY";

  // Convert key components to base64
  const nBase64 = bytesToBase64(
    bigIntToBytes(key.n, Math.ceil(key.n.toString(2).length / 8))
  );

  let keyData: string;
  if (isPrivate && key.d) {
    const dBytes = bigIntToBytes(
      key.d,
      Math.ceil(key.d.toString(2).length / 8)
    );
    const dBase64 = bytesToBase64(dBytes);
    keyData = `n: ${nBase64}\nd: ${dBase64}`;
  } else if (!isPrivate && key.e) {
    const eBytes = bigIntToBytes(
      key.e,
      Math.ceil(key.e.toString(2).length / 8)
    );
    const eBase64 = bytesToBase64(eBytes);
    keyData = `n: ${nBase64}\ne: ${eBase64}`;
  } else {
    throw new Error("Invalid key format");
  }

  // Simple PEM-like format (simplified for this implementation)
  const pemLines = [
    `-----BEGIN ${keyType}-----`,
    ...chunkString(keyData, 64),
    `-----END ${keyType}-----`,
  ];

  return pemLines.join("\n");
}

// Parse PEM key
export function parseKeyPEM(pemString: string): {
  n: bigint;
  e?: bigint;
  d?: bigint;
} {
  const lines = pemString
    .split("\n")
    .filter((line) => line.trim() && !line.includes("-----"));
  const keyData = lines.join("");

  const nMatch = keyData.match(/n:\s*([^\s]+)/);
  const eMatch = keyData.match(/e:\s*([^\s]+)/);
  const dMatch = keyData.match(/d:\s*([^\s]+)/);

  if (!nMatch) {
    throw new Error("Invalid PEM format: missing n");
  }

  const n = bytesToBigInt(base64ToBytes(nMatch[1]));

  const result: { n: bigint; e?: bigint; d?: bigint } = { n };

  if (eMatch) {
    result.e = bytesToBigInt(base64ToBytes(eMatch[1]));
  }

  if (dMatch) {
    result.d = bytesToBigInt(base64ToBytes(dMatch[1]));
  }

  return result;
}

// Helper to chunk string
function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}
