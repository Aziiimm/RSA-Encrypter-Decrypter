# RSA Encryption & Decryption

## Usage

### Generating Keys

1. Select your desired key size:
   - **8-bit**: For teaching and visualization (NOT secure)
   - **2048-bit**: For secure encryption
2. Click "Generate New Key Pair"
3. Your public and private keys will be displayed
4. Use the "Copy" buttons to copy keys to clipboard

### Encrypting Messages

1. Ensure you have generated a key pair
2. Enter your plaintext message in the input area
3. Click "Encrypt"
4. The encrypted ciphertext (Base64 encoded) will appear in the output area
5. View the step-by-step encryption process in the process visualization panel

### Decrypting Messages

1. Ensure you have the matching private key
2. Switch to "Decrypt" mode
3. Paste the Base64-encoded ciphertext
4. Click "Decrypt"
5. The decrypted plaintext will appear in the output area
6. View the step-by-step decryption process in the process visualization panel

## Technical Details

### RSA Implementation

The application implements RSA encryption from scratch:

- **Prime Generation**: Uses Miller-Rabin primality test for generating large primes
- **Key Generation**:
  - Calculates n = p × q (modulus)
  - Uses public exponent e = 65537 (or e = 3 for small keys)
  - Calculates private exponent d using Extended Euclidean Algorithm
- **Encryption**: c = m^e mod n
- **Decryption**: m = c^d mod n
- **Padding**: PKCS#1 v1.5 style padding for secure keys (disabled for 8-bit teaching mode)

### Key Sizes

- **8-bit (Teaching)**:
  - Primes: p=2, q=3
  - Modulus: n=6
  - No padding applied
  - Perfect for understanding RSA concepts
- **2048-bit (Secure)**:
  - Two 1024-bit primes
  - Full PKCS#1 v1.5 padding
  - Suitable for production use
