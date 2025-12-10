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

// Generate RSA key pair with specified key size
export function generateKeyPair(keySize: number = 2048): RSAKeyPair {
  let p: bigint, q: bigint;

  if (keySize === 32) {
    // Teaching mode: use small primes for visualization
    // p=13, q=17 gives n=221 (readable, can encrypt ASCII 0-220, covers most text)
    p = 13n;
    q = 17n;
  } else {
    // Production mode: generate large primes
    // For keySize bits, each prime should be keySize/2 bits
    const primeBits = keySize / 2;
    p = generateLargePrime(primeBits);
    q = generateLargePrime(primeBits);
  }

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  // Public exponent
  // For small keys, use smaller e (3 or 5)
  // For large keys, use 65537
  let e: bigint;
  if (keySize === 32) {
    // For small keys, try e=3 first, then 5, then 7
    e = 3n;
    while (e < phi && phi % e === 0n) {
      e = e + 2n;
    }
    if (e >= phi) {
      e = 3n; // Fallback
    }
  } else {
    e = 65537n;
  }

  // Private exponent
  const d = modInverse(e, phi);

  return {
    publicKey: { n, e },
    privateKey: { n, d },
  };
}

// Get maximum message size for a given key
function getMaxMessageSize(n: bigint): number {
  // For small teaching keys, no padding is used
  if (n < 256n) {
    // Can only encrypt values less than n
    // For single characters (0-127), we need n > 127
    // For n=6, we can only encrypt values 0-5 (very limited)
    // For n=15, we can encrypt values 0-14
    // For n=35, we can encrypt values 0-34
    return 1; // Always 1 byte for teaching mode
  }

  // Key size in bytes
  const keySizeBytes = Math.ceil(n.toString(2).length / 8);
  // Leave room for padding: 0x00 0x02 [at least 8 random bytes] 0x00 [message]
  // Minimum padding overhead is 11 bytes
  const maxBytes = keySizeBytes - 11;
  return Math.max(1, maxBytes);
}

// Simple PKCS#1 v1.5 style padding (for educational purposes)
function padMessage(message: bigint, keySizeBytes: number, n: bigint): bigint {
  // For small teaching keys, use simple padding or no padding
  if (n < 256n) {
    // For n < 100, just ensure message < n
    if (message >= n) {
      throw new Error("Message too large for key size");
    }
    // Return message as-is for very small keys (no padding for simplicity)
    return message;
  }

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
function unpadMessage(padded: bigint, keySizeBytes: number, n: bigint): bigint {
  // For small teaching keys, no padding was applied
  if (n < 256n) {
    return padded;
  }

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

  // For small teaching keys (n < 256), encrypt character by character
  // Each character must have ASCII value < n
  if (publicKey.n < 256n) {
    const chunks: string[] = [];
    const keySizeBytes = Math.ceil(publicKey.n.toString(2).length / 8);

    for (let i = 0; i < message.length; i++) {
      const charCode = message.charCodeAt(i);
      if (charCode >= Number(publicKey.n)) {
        throw new Error(
          `Character '${message[i]}' (ASCII ${charCode}) cannot be encrypted with key size n=${publicKey.n}. ` +
            `Only characters with ASCII values 0-${
              Number(publicKey.n) - 1
            } are supported. ` +
            `Try using single digits (0-${
              Number(publicKey.n) - 1
            }) or single letters with low ASCII values.`
        );
      }

      const charBigInt = BigInt(charCode);
      const encrypted = modPow(charBigInt, publicKey.e, publicKey.n);

      // Convert to base64
      const encryptedBytes = bigIntToBytes(encrypted, keySizeBytes);
      chunks.push(bytesToBase64(encryptedBytes));
    }

    return chunks.join(":");
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
    const padded = padMessage(chunkBigInt, keySizeBytes, publicKey.n);
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

  // For small teaching keys (n < 256), encrypt character by character
  if (publicKey.n < 256n) {
    const chunks: string[] = [];
    const keySizeBytes = Math.ceil(publicKey.n.toString(2).length / 8);

    addStep(
      "Character-by-Character Encryption",
      `Encrypting each character separately (n=${publicKey.n}, max ASCII: ${
        Number(publicKey.n) - 1
      })`,
      "active",
      undefined,
      "Each character must have ASCII value < n"
    );

    for (let i = 0; i < message.length; i++) {
      const char = message[i];
      const charCode = message.charCodeAt(i);

      if (charCode >= Number(publicKey.n)) {
        throw new Error(
          `Character '${char}' (ASCII ${charCode}) cannot be encrypted with key size n=${publicKey.n}. ` +
            `Only characters with ASCII values 0-${
              Number(publicKey.n) - 1
            } are supported. ` +
            `Try using single digits (0-${
              Number(publicKey.n) - 1
            }) or single letters with low ASCII values.`
        );
      }

      addStep(
        `Encrypting Character ${i + 1}: '${char}'`,
        `ASCII value: ${charCode}, Encrypting: ${charCode}^${publicKey.e.toString()} mod ${publicKey.n.toString()}`,
        "active",
        undefined,
        `Character '${char}' (ASCII ${charCode})`
      );

      const charBigInt = BigInt(charCode);
      const encrypted = modPow(charBigInt, publicKey.e, publicKey.n);

      addStep(
        `Encoding Character ${i + 1}`,
        "Converting to Base64",
        "active",
        undefined,
        `Encrypted value: ${encrypted.toString()}`
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

    const padded = padMessage(chunkBigInt, keySizeBytes, publicKey.n);
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

  // For very small keys (n < 100), decrypt character by character
  if (privateKey.n < 256n) {
    for (const chunk of chunks) {
      // Decode from base64
      let encryptedBytes = base64ToBytes(chunk);

      // Ensure we have exactly keySizeBytes
      if (encryptedBytes.length < keySizeBytes) {
        const paddedBytes = new Uint8Array(keySizeBytes);
        paddedBytes.set(encryptedBytes, keySizeBytes - encryptedBytes.length);
        encryptedBytes = paddedBytes;
      } else if (encryptedBytes.length > keySizeBytes) {
        encryptedBytes = encryptedBytes.slice(-keySizeBytes);
      }

      const encrypted = bytesToBigInt(encryptedBytes);

      // Decrypt (no unpadding for small keys)
      const decrypted = modPow(encrypted, privateKey.d, privateKey.n);

      // Convert back to character
      const charCode = Number(decrypted);
      decryptedChunks.push(String.fromCharCode(charCode));
    }

    return decryptedChunks.join("");
  }

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
    const messageBigInt = unpadMessage(padded, keySizeBytes, privateKey.n);

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

  // For very small keys (n < 100), decrypt character by character
  if (privateKey.n < 256n) {
    addStep(
      "Character-by-Character Decryption",
      `Decrypting each character separately (n=${privateKey.n})`,
      "active",
      undefined,
      "Each chunk represents one encrypted character"
    );

    for (let i = 0; i < chunks.length; i++) {
      addStep(
        `Decoding Character ${i + 1}`,
        "Converting Base64 to bytes",
        "active",
        undefined,
        "Base64 decoding"
      );

      // Decode from base64
      let encryptedBytes = base64ToBytes(chunks[i]);

      // Ensure we have exactly keySizeBytes
      if (encryptedBytes.length < keySizeBytes) {
        const paddedBytes = new Uint8Array(keySizeBytes);
        paddedBytes.set(encryptedBytes, keySizeBytes - encryptedBytes.length);
        encryptedBytes = paddedBytes;
      } else if (encryptedBytes.length > keySizeBytes) {
        encryptedBytes = encryptedBytes.slice(-keySizeBytes);
      }

      const encrypted = bytesToBigInt(encryptedBytes);

      addStep(
        `Decrypting Character ${i + 1}`,
        `Performing: m = c^${privateKey.d.toString()} mod ${privateKey.n.toString()}`,
        "active",
        undefined,
        `Decrypting encrypted value`
      );

      const decrypted = modPow(encrypted, privateKey.d, privateKey.n);

      addStep(
        `Converting Character ${i + 1}`,
        "Converting decrypted value to character",
        "active",
        undefined,
        `Decrypted value: ${decrypted.toString()} → ASCII ${Number(decrypted)}`
      );

      const charCode = Number(decrypted);
      const char = String.fromCharCode(charCode);
      decryptedChunks.push(char);
    }

    const result = decryptedChunks.join("");

    addStep(
      "Complete",
      "Decryption finished successfully",
      "completed",
      result.substring(0, 50) + (result.length > 50 ? "..." : ""),
      `Decrypted message: "${result}"`
    );

    return result;
  }

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

    const messageBigInt = unpadMessage(padded, keySizeBytes, privateKey.n);

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
