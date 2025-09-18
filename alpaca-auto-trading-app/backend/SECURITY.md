# 🔐 Security Guide - API Key Encryption

This guide explains how to securely store and manage API keys in the Alpaca Trading App using encryption.

## 🚨 Why Encrypt API Keys?

- **Security**: Prevents API keys from being exposed in plain text
- **Compliance**: Meets security best practices for sensitive data
- **Protection**: Safeguards against accidental exposure in logs or version control
- **Flexibility**: Allows secure storage in environment variables or configuration files

## 🛠️ How It Works

The application uses **Fernet symmetric encryption** from the `cryptography` library:

1. **Encryption Key**: A master key encrypts/decrypts all API keys
2. **Environment Variables**: Encrypted keys are stored as environment variables
3. **Runtime Decryption**: Keys are decrypted only when needed for API calls
4. **Memory Security**: Decrypted keys are not stored permanently in memory

## 📋 Setup Instructions

### 1. Install Dependencies

The encryption functionality is already included in `requirements.txt`:

```bash
pip install cryptography==41.0.7
```

### 2. Generate Encryption Key

For **production**, generate a secure encryption key:

```python
from app.core.encryption import generate_key
key = generate_key()
print(f"SECRET_KEY={key}")
```

**⚠️ Important**: Save this key securely! You'll need it to decrypt your API keys.

### 3. Encrypt Your API Keys

Use the provided utility script:

```bash
python encrypt_keys.py
```

Or encrypt manually:

```python
from app.core.encryption import encrypt_api_keys, encrypt

# Encrypt Alpaca keys
enc_api, enc_secret = encrypt_api_keys("your_api_key", "your_secret_key")

# Encrypt OpenAI key
enc_openai = encrypt("your_openai_key")
```

### 4. Update Environment Variables

Add the encrypted keys to your `.env` file:

```env
# Encryption key (keep this secret!)
SECRET_KEY=your_generated_encryption_key_here

# Encrypted API keys
ENCRYPTED_APCA_API_KEY_ID=encrypted_api_key_here
ENCRYPTED_APCA_API_SECRET_KEY=encrypted_secret_key_here
ENCRYPTED_OPENAI_API_KEY=encrypted_openai_key_here

# Remove or comment out plain text versions
# APCA_API_KEY_ID=your_plain_key
# APCA_API_SECRET_KEY=your_plain_secret
# OPENAI_API_KEY=your_plain_key
```

## 🔧 Usage in Code

The secure configuration automatically handles encryption/decryption:

```python
from app.core.secure_config import get_secure_config

config = get_secure_config()

# These properties automatically decrypt the keys
api_key = config.api_key
secret_key = config.secret_key
openai_key = config.openai_api_key

# Get HTTP headers for API requests
headers = config.get_headers()
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Environment   │    │  Secure Config   │    │   Alpaca API    │
│   Variables     │───▶│     Manager      │───▶│    Service      │
│                 │    │                  │    │                 │
│ ENCRYPTED_*     │    │  Auto-decrypt    │    │  Uses decrypted │
│ SECRET_KEY      │    │  On-demand       │    │  keys securely  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔒 Security Best Practices

### ✅ Do:
- Use different `SECRET_KEY` values for different environments
- Store `SECRET_KEY` in a secure secrets management service
- Rotate encryption keys periodically
- Use strong, randomly generated encryption keys
- Monitor access to encrypted keys

### ❌ Don't:
- Commit `SECRET_KEY` to version control
- Use the same encryption key across environments
- Store plain text API keys alongside encrypted ones
- Log decrypted API keys
- Share encryption keys in plain text

## 🚀 Migration from Plain Text

If you're currently using plain text API keys:

1. **Backup** your current `.env` file
2. **Encrypt** your existing API keys using the utility
3. **Update** your `.env` file with encrypted versions
4. **Remove** plain text API keys
5. **Test** that the application still works
6. **Restart** your application

## 🧪 Testing

Test the encryption functionality:

```python
from app.core.encryption import encrypt, decrypt

# Test encryption/decryption
test_data = "test-api-key-12345"
encrypted = encrypt(test_data)
decrypted = decrypt(encrypted)
assert test_data == decrypted
print("✅ Encryption test passed!")
```

## 🔍 Troubleshooting

### Common Issues:

**"Invalid encryption key or token"**
- Check that `SECRET_KEY` is set correctly
- Ensure the same key was used for encryption and decryption
- Verify the encrypted keys haven't been corrupted

**"API keys not configured"**
- Check that encrypted environment variables are set
- Verify the encryption/decryption process worked correctly
- Ensure the application can access the environment variables

**"ModuleNotFoundError: No module named 'cryptography'"**
- Install the cryptography package: `pip install cryptography`
- Ensure you're using the correct Python environment

## 📚 API Reference

### `app.core.encryption`

- `encrypt(plain: str) -> str`: Encrypt a string
- `decrypt(token: str) -> str`: Decrypt a string
- `generate_key() -> str`: Generate a new encryption key
- `encrypt_api_keys(api_key: str, secret_key: str) -> tuple[str, str]`: Encrypt API keys

### `app.core.secure_config`

- `get_secure_config() -> SecureConfig`: Get the global config instance
- `config.api_key`: Get decrypted API key
- `config.secret_key`: Get decrypted secret key
- `config.get_headers() -> dict`: Get HTTP headers for API requests

## 🆘 Support

If you encounter issues with the encryption system:

1. Check the troubleshooting section above
2. Verify your environment variables are set correctly
3. Test the encryption/decryption process manually
4. Check the application logs for error messages

---

**🔐 Remember: Security is a shared responsibility. Keep your encryption keys safe!**
