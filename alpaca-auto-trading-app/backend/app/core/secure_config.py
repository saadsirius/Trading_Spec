"""
Secure configuration management with encrypted API keys.

This module provides secure access to configuration values, including
encrypted API keys that are decrypted on-demand.
"""

import os
from typing import Optional
from .encryption import encrypt, decrypt, encrypt_api_keys, decrypt_api_keys


class SecureConfig:
    """
    Secure configuration manager that handles encrypted API keys.
    """
    
    def __init__(self):
        self._encrypted_api_key: Optional[str] = None
        self._encrypted_secret_key: Optional[str] = None
        self._decrypted_api_key: Optional[str] = None
        self._decrypted_secret_key: Optional[str] = None
        
        # Load encrypted keys from environment
        self._load_encrypted_keys()
    
    def _load_encrypted_keys(self):
        """Load encrypted API keys from environment variables."""
        self._encrypted_api_key = os.getenv("ENCRYPTED_APCA_API_KEY_ID")
        self._encrypted_secret_key = os.getenv("ENCRYPTED_APCA_API_SECRET_KEY")
    
    @property
    def api_key(self) -> Optional[str]:
        """Get the decrypted Alpaca API key."""
        if not self._encrypted_api_key:
            # Fallback to plain text for backward compatibility
            return os.getenv("APCA_API_KEY_ID")
        
        if not self._decrypted_api_key:
            try:
                self._decrypted_api_key = decrypt(self._encrypted_api_key)
            except ValueError as e:
                print(f"Failed to decrypt API key: {e}")
                return None
        
        return self._decrypted_api_key
    
    @property
    def secret_key(self) -> Optional[str]:
        """Get the decrypted Alpaca secret key."""
        if not self._encrypted_secret_key:
            # Fallback to plain text for backward compatibility
            return os.getenv("APCA_API_SECRET_KEY")
        
        if not self._decrypted_secret_key:
            try:
                self._decrypted_secret_key = decrypt(self._encrypted_secret_key)
            except ValueError as e:
                print(f"Failed to decrypt secret key: {e}")
                return None
        
        return self._decrypted_secret_key
    
    @property
    def base_url(self) -> str:
        """Get the Alpaca API base URL."""
        return os.getenv("APCA_API_BASE_URL", "https://paper-api.alpaca.markets")
    
    @property
    def openai_api_key(self) -> Optional[str]:
        """Get the OpenAI API key (can be encrypted or plain text)."""
        encrypted_key = os.getenv("ENCRYPTED_OPENAI_API_KEY")
        if encrypted_key:
            try:
                return decrypt(encrypted_key)
            except ValueError:
                pass
        
        # Fallback to plain text
        return os.getenv("OPENAI_API_KEY")
    
    def are_keys_configured(self) -> bool:
        """Check if API keys are properly configured."""
        return bool(self.api_key and self.secret_key)
    
    def encrypt_and_store_keys(self, api_key: str, secret_key: str) -> tuple[str, str]:
        """
        Encrypt API keys and return the encrypted versions for storage.
        
        Args:
            api_key (str): The plain text API key
            secret_key (str): The plain text secret key
            
        Returns:
            tuple[str, str]: Encrypted API key and secret key
        """
        return encrypt_api_keys(api_key, secret_key)
    
    def get_headers(self) -> dict[str, str]:
        """
        Get HTTP headers for Alpaca API requests.
        
        Returns:
            dict: Headers with API keys
            
        Raises:
            ValueError: If API keys are not configured
        """
        if not self.are_keys_configured():
            raise ValueError("API keys not configured")
        
        return {
            "APCA-API-KEY-ID": self.api_key,
            "APCA-API-SECRET-KEY": self.secret_key,
            "Content-Type": "application/json"
        }


# Global instance
secure_config = SecureConfig()


def get_secure_config() -> SecureConfig:
    """Get the global secure configuration instance."""
    return secure_config


# Utility functions for key management
def setup_encrypted_keys(api_key: str, secret_key: str) -> None:
    """
    Helper function to encrypt and display keys for environment setup.
    
    Args:
        api_key (str): The plain text API key
        secret_key (str): The plain text secret key
    """
    encrypted_api, encrypted_secret = encrypt_api_keys(api_key, secret_key)
    
    print("🔐 Encrypted API Keys for Environment Variables:")
    print(f"ENCRYPTED_APCA_API_KEY_ID={encrypted_api}")
    print(f"ENCRYPTED_APCA_API_SECRET_KEY={encrypted_secret}")
    print("\n⚠️  Add these to your .env file and remove the plain text versions!")


if __name__ == "__main__":
    # Example usage
    config = get_secure_config()
    
    print("🔍 Configuration Status:")
    print(f"API Key configured: {bool(config.api_key)}")
    print(f"Secret Key configured: {bool(config.secret_key)}")
    print(f"Base URL: {config.base_url}")
    print(f"OpenAI Key configured: {bool(config.openai_api_key)}")
    
    if config.are_keys_configured():
        print("✅ API keys are properly configured")
    else:
        print("❌ API keys are not configured")
        print("\nTo set up encrypted keys, use:")
        print("from app.core.secure_config import setup_encrypted_keys")
        print("setup_encrypted_keys('your_api_key', 'your_secret_key')")
