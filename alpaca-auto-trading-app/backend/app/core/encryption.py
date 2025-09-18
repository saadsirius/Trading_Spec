"""
Encryption utilities for secure handling of sensitive data like API keys.

This module provides functions to encrypt and decrypt sensitive information
using the Fernet symmetric encryption from the cryptography library.
"""

from cryptography.fernet import Fernet, InvalidToken
import os
import base64
import hashlib


def _fernet() -> Fernet:
    """
    Get a Fernet instance for encryption/decryption.
    
    Returns:
        Fernet: Configured Fernet instance
        
    Raises:
        ValueError: If no valid encryption key can be derived
    """
    key = os.getenv("SECRET_KEY")
    if not key:
        # For development, derive a key from a passphrase
        passphrase = os.getenv("SECRET_PASSPHRASE", "dev-secret-change-me").encode()
        # Generate a consistent key from the passphrase
        key_bytes = hashlib.sha256(passphrase).digest()
        key = base64.urlsafe_b64encode(key_bytes).decode()
        print("⚠️  WARNING: Using development encryption key. Set SECRET_KEY for production!")
    
    try:
        # Ensure key is properly formatted
        if isinstance(key, str):
            key_bytes = key.encode() if not key.endswith('=') else key.encode()
        else:
            key_bytes = key
            
        return Fernet(key_bytes)
    except Exception as e:
        raise ValueError(f"Invalid encryption key format: {e}")


def encrypt(plain: str) -> str:
    """
    Encrypt a plain text string.
    
    Args:
        plain (str): The plain text to encrypt
        
    Returns:
        str: The encrypted string (base64 encoded)
        
    Raises:
        ValueError: If encryption fails
    """
    if not plain:
        raise ValueError("Cannot encrypt empty string")
    
    try:
        return _fernet().encrypt(plain.encode()).decode()
    except Exception as e:
        raise ValueError(f"Encryption failed: {e}")


def decrypt(token: str) -> str:
    """
    Decrypt an encrypted string.
    
    Args:
        token (str): The encrypted string to decrypt
        
    Returns:
        str: The decrypted plain text
        
    Raises:
        ValueError: If decryption fails or token is invalid
    """
    if not token:
        raise ValueError("Cannot decrypt empty token")
    
    try:
        return _fernet().decrypt(token.encode()).decode()
    except InvalidToken:
        raise ValueError("Invalid encryption key or token")
    except Exception as e:
        raise ValueError(f"Decryption failed: {e}")


def generate_key() -> str:
    """
    Generate a new Fernet encryption key.
    
    Returns:
        str: A new base64-encoded Fernet key
    """
    return Fernet.generate_key().decode()


def encrypt_api_keys(api_key: str, secret_key: str) -> tuple[str, str]:
    """
    Encrypt Alpaca API keys.
    
    Args:
        api_key (str): The Alpaca API key
        secret_key (str): The Alpaca secret key
        
    Returns:
        tuple[str, str]: Encrypted API key and secret key
    """
    return encrypt(api_key), encrypt(secret_key)


def decrypt_api_keys(encrypted_api_key: str, encrypted_secret_key: str) -> tuple[str, str]:
    """
    Decrypt Alpaca API keys.
    
    Args:
        encrypted_api_key (str): The encrypted API key
        encrypted_secret_key (str): The encrypted secret key
        
    Returns:
        tuple[str, str]: Decrypted API key and secret key
    """
    return decrypt(encrypted_api_key), decrypt(encrypted_secret_key)


# Example usage and testing
if __name__ == "__main__":
    # Test the encryption functions
    test_data = "test-api-key-12345"
    
    print("Testing encryption/decryption...")
    print(f"Original: {test_data}")
    
    encrypted = encrypt(test_data)
    print(f"Encrypted: {encrypted}")
    
    decrypted = decrypt(encrypted)
    print(f"Decrypted: {decrypted}")
    
    print(f"Success: {test_data == decrypted}")
    
    # Generate a new key for production use
    new_key = generate_key()
    print(f"\nNew encryption key for production: {new_key}")
