# RSA Encryption/Decryption - Presentation Outline

## Slide Structure (Recommended: 12-15 slides)

---

### **Slide 1: Title Slide**

- **Title**: RSA Encryption & Decryption
- **Subtitle**: Custom Implementation from Scratch
- **Your Name/Team**
- **Date**

---

### **Slide 2: What is RSA?**

- **Definition**: RSA (Rivest-Shamir-Adleman) is a public-key cryptosystem
- **Key Concept**:
  - Asymmetric encryption (different keys for encryption/decryption)
  - Based on the mathematical difficulty of factoring large prime numbers
- **Visual**: Diagram showing Public Key → Encryption → Ciphertext → Decryption → Private Key

---

### **Slide 3: Why Build RSA from Scratch?**

- **Educational Purpose**: Understanding the algorithm at a fundamental level
- **Learning Objectives**:
  - Prime number generation
  - Modular arithmetic
  - Key pair generation
  - Encryption/decryption process
- **Hands-on Experience**: Implementing cryptographic concepts

---

### **Slide 4: Project Overview**

- **What We Built**:
  - Web application for RSA encryption/decryption
  - Custom implementation using JavaScript BigInt
  - Modern UI with process visualization
- **Key Features**:
  - Dual key sizes (8-bit teaching, 2048-bit secure)
  - Step-by-step process visualization
  - Key generation and management
- **Tech Stack**: React, TypeScript, Vite, Tailwind CSS

---

### **Slide 5: RSA Algorithm - Mathematical Foundation**

- **Core Components**:
  1. **Two large primes**: p and q
  2. **Modulus**: n = p × q
  3. **Euler's totient**: φ(n) = (p-1) × (q-1)
  4. **Public exponent**: e (commonly 65537)
  5. **Private exponent**: d = e⁻¹ mod φ(n)
- **Key Equations**:
  - Encryption: c = m^e mod n
  - Decryption: m = c^d mod n

---

### **Slide 6: Implementation - Prime Generation**

- **Challenge**: Generate large random primes
- **Solution**: Miller-Rabin Primality Test
  - Probabilistic test (k iterations for confidence)
  - Efficient for large numbers
  - Uses modular exponentiation
- **Process**:
  1. Generate random candidate
  2. Test for primality
  3. Repeat until prime found
- **Code Snippet**: Show `generateLargePrime()` function

---

### **Slide 7: Implementation - Key Generation**

- **Step-by-Step Process**:
  1. Generate two primes: p and q (1024 bits each for 2048-bit key)
  2. Calculate n = p × q
  3. Calculate φ(n) = (p-1) × (q-1)
  4. Choose public exponent e = 65537
  5. Calculate private exponent d using Extended Euclidean Algorithm
- **Key Insight**: Security depends on difficulty of factoring n
- **Code Snippet**: Show `generateKeyPair()` function

---

### **Slide 8: Implementation - Encryption Process**

- **Steps**:
  1. Convert message to bytes
  2. Split into chunks (if message > key size)
  3. Apply PKCS#1 v1.5 padding
  4. Perform modular exponentiation: c = m^e mod n
  5. Encode to Base64
- **Padding Purpose**: Security (prevents certain attacks)
- **Visual**: Show padding structure (0x00 0x02 [random] 0x00 [message])
- **Code Snippet**: Show `encrypt()` function

---

### **Slide 9: Implementation - Decryption Process**

- **Steps** (Reverse of encryption):
  1. Decode from Base64
  2. Perform modular exponentiation: m = c^d mod n
  3. Remove PKCS#1 padding
  4. Convert bytes back to text
  5. Combine chunks
- **Key Point**: Only private key holder can decrypt
- **Code Snippet**: Show `decrypt()` function

---

### **Slide 10: Teaching Mode vs Secure Mode**

- **8-bit Teaching Mode**:
  - Primes: p=2, q=3 → n=6
  - No padding (for simplicity)
  - Visible key values
  - Perfect for understanding concepts
- **2048-bit Secure Mode**:
  - Two 1024-bit primes
  - Full PKCS#1 padding
  - Production-ready security
- **Why Both?**: Education + Real-world application

---

### **Slide 11: Key Implementation Challenges & Solutions**

- **Challenge 1**: Large Integer Arithmetic
  - **Solution**: JavaScript BigInt (native support for arbitrary precision)
- **Challenge 2**: Efficient Modular Exponentiation
  - **Solution**: Exponentiation by squaring (O(log n) complexity)
- **Challenge 3**: Secure Random Number Generation
  - **Solution**: Web Crypto API's `crypto.getRandomValues()`
- **Challenge 4**: Message Chunking
  - **Solution**: Split large messages into key-size chunks

---

### **Slide 12: UI Features & Process Visualization**

- **Key Generator**:
  - Select key size (8-bit or 2048-bit)
  - Generate and display keys
  - Copy functionality
- **Encryption/Decryption**:
  - Split-view layout
  - Mode toggle
  - Real-time process visualization
- **Process Steps Display**:
  - Shows each step of encryption/decryption
  - Status indicators (pending, active, completed)
  - Intermediate values

---

### **Slide 13: Live Demo**

- **Demo Flow**:
  1. Generate 8-bit keys (show key values)
  2. Encrypt a message (show process steps)
  3. Show ciphertext
  4. Decrypt (show reverse process)
  5. Switch to 2048-bit and show secure encryption
- **Highlight**: Process visualization in action
- **Key Points**:
  - Same algorithm, different key sizes
  - Process transparency for learning

---

### **Slide 14: Security Considerations**

- **8-bit Keys**:
  - ⚠️ NOT secure - for education only
  - Can be broken instantly
- **2048-bit Keys**:
  - ✓ Industry standard
  - Estimated security until ~2030
  - Requires factoring 617-digit number
- **Best Practices**:
  - Never share private keys
  - Use secure key sizes for real data
  - This is educational - use tested libraries for production

---

### **Slide 15: Key Takeaways & Learnings**

- **What We Learned**:
  - RSA algorithm fundamentals
  - Prime number generation
  - Modular arithmetic applications
  - Cryptographic implementation challenges
- **Technical Skills**:
  - BigInt arithmetic
  - Algorithm optimization
  - UI/UX for educational tools
- **Future Improvements**:
  - Additional key sizes
  - Key import/export
  - Performance optimizations

---

### **Slide 16: Q&A / Thank You**

- Questions?
- **Contact/GitHub**: [Your info]
- **Thank You!**

---

## Presentation Tips

### **Visual Elements to Include**:

1. **Diagrams**:

   - RSA key generation flow
   - Encryption/decryption process
   - Public/private key relationship

2. **Code Snippets** (Keep Simple):

   - Key generation function
   - Encryption function
   - Modular exponentiation

3. **Screenshots**:

   - App interface
   - Process visualization
   - Key generation

4. **Mathematical Formulas**:
   - n = p × q
   - c = m^e mod n
   - m = c^d mod n

### **Demo Preparation**:

1. **Prepare Test Messages**:

   - Short message for 8-bit demo
   - Longer message for 2048-bit demo

2. **Have Keys Pre-generated** (Optional):

   - For faster demo, generate keys beforehand
   - But show generation process too

3. **Practice Flow**:
   - 8-bit encryption → decryption
   - Show process visualization
   - Switch to 2048-bit
   - Show secure encryption

### **Speaking Points**:

- **Emphasize**: Educational purpose, learning from implementation
- **Explain**: Why we built from scratch (understanding > using libraries)
- **Highlight**: Process visualization as unique feature
- **Mention**: Challenges faced and how they were solved

### **Time Allocation** (15-20 min presentation):

- Introduction: 2 min
- RSA Basics: 3 min
- Implementation Details: 5-7 min
- Demo: 5-7 min
- Q&A: 3-5 min

---

## Additional Resources for Slides

### **Visuals to Create**:

1. RSA Key Generation Flowchart
2. Encryption/Decryption Diagram
3. Padding Structure Diagram
4. Process Visualization Screenshot

### **Code Examples to Show**:

- `generateKeyPair()` - Key generation
- `modPow()` - Fast modular exponentiation
- `encrypt()` - Encryption with padding
- `decrypt()` - Decryption with unpadding

### **Statistics to Mention**:

- 2048-bit key = ~617 decimal digits
- Estimated time to factor: billions of years with current tech
- Key generation time: ~few seconds for 2048-bit
