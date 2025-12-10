# RSA Presentation - Visual Diagrams Reference

## Diagram 1: RSA Key Generation Flow

```
┌─────────────────────────────────────────────────┐
│           RSA Key Generation Process           │
└─────────────────────────────────────────────────┘

Step 1: Generate Primes
    ┌─────────┐      ┌─────────┐
    │ Prime p │      │ Prime q │
    │ (1024b) │      │ (1024b) │
    └─────────┘      └─────────┘
         │                │
         └──────┬─────────┘
                │
                ▼
Step 2: Calculate Modulus
         n = p × q
         (2048 bits)
                │
                ▼
Step 3: Calculate φ(n)
    φ(n) = (p-1) × (q-1)
                │
                ▼
Step 4: Choose Public Exponent
         e = 65537
                │
                ▼
Step 5: Calculate Private Exponent
    d = e⁻¹ mod φ(n)
    (Extended Euclidean Algorithm)
                │
                ▼
    ┌───────────────────────┐
    │   Public Key: (n, e)   │
    │  Private Key: (n, d)   │
    └───────────────────────┘
```

## Diagram 2: Encryption/Decryption Flow

```
┌─────────────────────────────────────────────────────┐
│              RSA Encryption Process                 │
└─────────────────────────────────────────────────────┘

Plaintext Message
        │
        ▼
Convert to Bytes
        │
        ▼
Split into Chunks (if needed)
        │
        ▼
Apply PKCS#1 Padding
    [0x00][0x02][random bytes][0x00][message]
        │
        ▼
Modular Exponentiation
    c = m^e mod n
        │
        ▼
Encode to Base64
        │
        ▼
    Ciphertext
```

```
┌─────────────────────────────────────────────────────┐
│             RSA Decryption Process                  │
└─────────────────────────────────────────────────────┘

    Ciphertext (Base64)
        │
        ▼
Decode from Base64
        │
        ▼
Modular Exponentiation
    m = c^d mod n
        │
        ▼
Remove PKCS#1 Padding
        │
        ▼
Convert Bytes to Text
        │
        ▼
Combine Chunks
        │
        ▼
    Plaintext Message
```

## Diagram 3: Public/Private Key Relationship

```
┌─────────────────────────────────────────────────────┐
│         RSA Public/Private Key Relationship         │
└─────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │   Public Key    │
    │   (n, e)        │
    │                 │
    │  Anyone can     │
    │  use this to    │
    │  ENCRYPT        │
    └────────┬────────┘
             │
             │ Encrypts
             ▼
    ┌─────────────────┐
    │   Ciphertext    │
    │   (Encrypted)   │
    └────────┬────────┘
             │
             │ Decrypts
             ▼
    ┌─────────────────┐
    │  Private Key    │
    │   (n, d)        │
    │                 │
    │  Only owner     │
    │  can use this   │
    │  to DECRYPT     │
    └─────────────────┘
```

## Diagram 4: PKCS#1 Padding Structure

```
┌─────────────────────────────────────────────────────┐
│          PKCS#1 v1.5 Padding Structure             │
└─────────────────────────────────────────────────────┘

Key Size: 256 bytes (2048 bits)

┌────┬────┬──────────────────────────┬────┬──────────┐
│0x00│0x02│  Random Non-Zero Bytes   │0x00│ Message  │
│    │    │  (at least 8 bytes)      │    │          │
└────┴────┴──────────────────────────┴────┴──────────┘
  ↑    ↑                              ↑      ↑
  │    │                              │      │
  │    │                              │      └─ Original message
  │    │                              └──────── Separator
  │    └─────────────────────────────────── Padding type
  └────────────────────────────────────────── Block type

Total: Exactly key size bytes
```

## Diagram 5: Miller-Rabin Primality Test

```
┌─────────────────────────────────────────────────────┐
│         Miller-Rabin Primality Test Flow            │
└─────────────────────────────────────────────────────┘

Candidate Number n
        │
        ▼
Is n even or < 2?
    Yes → Not Prime
    No  → Continue
        │
        ▼
Write n-1 = d × 2^r
        │
        ▼
Repeat k times (k=10 for confidence):
    ┌─────────────────────┐
    │ Pick random a       │
    │ (2 ≤ a ≤ n-2)       │
    └──────────┬──────────┘
               │
               ▼
    Compute x = a^d mod n
               │
        ┌──────┴──────┐
        │             │
    x=1 or        x≠1 and
    x=n-1         x≠n-1
        │             │
        │             ▼
        │      Check x^2 mod n
        │      for r-1 iterations
        │             │
        └──────┬──────┘
               │
        All tests pass?
               │
        ┌──────┴──────┐
    Yes │            │ No
        │            │
        ▼            ▼
   Probably      Composite
     Prime
```

## Diagram 6: Extended Euclidean Algorithm

```
┌─────────────────────────────────────────────────────┐
│    Extended Euclidean Algorithm (Modular Inverse)  │
└─────────────────────────────────────────────────────┘

Goal: Find d such that e × d ≡ 1 (mod φ(n))

Initialize:
    old_r = e,  r = φ(n)
    old_s = 1,  s = 0

While r ≠ 0:
    quotient = old_r ÷ r
    
    temp_r = r
    r = old_r - quotient × r
    old_r = temp_r
    
    temp_s = s
    s = old_s - quotient × s
    old_s = temp_s

If old_r = 1:
    Return old_s (this is d)
Else:
    No modular inverse exists
```

## Diagram 7: Fast Modular Exponentiation

```
┌─────────────────────────────────────────────────────┐
│      Fast Modular Exponentiation (Exponentiation    │
│                    by Squaring)                     │
└─────────────────────────────────────────────────────┘

Compute: base^exp mod mod

result = 1
base = base mod mod

While exp > 0:
    If exp is odd:
        result = (result × base) mod mod
    
    exp = exp ÷ 2
    base = (base × base) mod mod

Return result

Example: 5^13 mod 7
    Binary: 13 = 1101₂
    Process: 5¹ × 5⁴ × 5⁸ mod 7
    Result: 5
```

## Diagram 8: Application Architecture

```
┌─────────────────────────────────────────────────────┐
│              Application Architecture                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    UI Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │KeyGenerator  │  │InputSection  │  │OutputSect │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                  │                 │       │
│         └──────────────────┼─────────────────┘       │
│                            │                         │
│                  ┌─────────▼─────────┐              │
│                  │ ProcessVisualization│             │
│                  └─────────────────────┘              │
└───────────────────────────┬───────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────┐
│                  RSA Utils Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │generateKeyPair│  │   encrypt    │  │  decrypt  │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                  │                 │       │
│         └──────────────────┼─────────────────┘       │
│                            │                         │
│         ┌──────────────────▼──────────────────┐     │
│         │   Helper Functions                   │     │
│         │  - generateLargePrime()               │     │
│         │  - modPow()                          │     │
│         │  - modInverse()                      │     │
│         │  - padMessage() / unpadMessage()     │     │
│         └──────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

## Text Descriptions for Slides

### Slide Visual 1: RSA Concept
```
┌─────────────────────────────────────┐
│         RSA Encryption              │
│                                     │
│  Alice wants to send message        │
│  to Bob securely                    │
│                                     │
│  Bob's Public Key ──┐                │
│                    │                │
│                    ▼                │
│              [Encrypt]              │
│                    │                │
│                    ▼                │
│            Ciphertext               │
│                    │                │
│                    ▼                │
│              [Decrypt]              │
│                    │                │
│  Bob's Private Key ─┘                │
│                    │                │
│                    ▼                │
│          Original Message           │
└─────────────────────────────────────┘
```

### Slide Visual 2: Key Sizes Comparison
```
┌─────────────────────────────────────────────────────┐
│              Key Size Comparison                    │
└─────────────────────────────────────────────────────┘

8-bit (Teaching)             2048-bit (Secure)
─────────────────            ──────────────────

p = 2                         p = 1024-bit prime
q = 3                         q = 1024-bit prime
n = 6                         n = ~617 digits
                              (2^2048)

Visible values                Hidden values
No padding                    Full PKCS#1 padding
Instant generation            ~2-5 seconds
NOT secure                   Industry standard
```

## Code Snippets for Slides

### Snippet 1: Key Generation (Simplified)
```typescript
function generateKeyPair(keySize: number) {
  // Generate primes
  const p = generateLargePrime(keySize / 2);
  const q = generateLargePrime(keySize / 2);
  
  // Calculate modulus
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  
  // Public exponent
  const e = 65537n;
  
  // Private exponent (modular inverse)
  const d = modInverse(e, phi);
  
  return {
    publicKey: { n, e },
    privateKey: { n, d }
  };
}
```

### Snippet 2: Fast Modular Exponentiation
```typescript
function modPow(base: bigint, exp: bigint, mod: bigint) {
  let result = 1n;
  base = base % mod;
  
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp >> 1n;  // Divide by 2
    base = (base * base) % mod;
  }
  
  return result;
}
```

### Snippet 3: Encryption
```typescript
function encrypt(message: string, publicKey) {
  // Convert to bytes
  const bytes = new TextEncoder().encode(message);
  
  // Pad message
  const padded = padMessage(bytes, keySize);
  
  // Encrypt: c = m^e mod n
  const ciphertext = modPow(padded, publicKey.e, publicKey.n);
  
  // Encode to Base64
  return bytesToBase64(ciphertext);
}
```

