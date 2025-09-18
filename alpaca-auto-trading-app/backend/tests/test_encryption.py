"""
Tests for encryption and security functionality.
"""

import pytest
from app.core.encryption import (
    encrypt, 
    decrypt, 
    generate_key, 
    encrypt_api_keys, 
    decrypt_api_keys,
    _fernet
)
from app.core.secure_config import SecureConfig, get_secure_config
from cryptography.fernet import Fernet, InvalidToken


class TestEncryption:
    """Test encryption and decryption functionality."""
    
    def test_encrypt_decrypt_roundtrip(self, temp_env_vars):
        """Test that encrypt/decrypt works correctly."""
        test_data = "test-api-key-12345"
        
        encrypted = encrypt(test_data)
        decrypted = decrypt(encrypted)
        
        assert decrypted == test_data
        assert encrypted != test_data
        assert len(encrypted) > len(test_data)
    
    def test_encrypt_empty_string(self, temp_env_vars):
        """Test encryption of empty string raises error."""
        with pytest.raises(ValueError, match="Cannot encrypt empty string"):
            encrypt("")
    
    def test_decrypt_empty_string(self, temp_env_vars):
        """Test decryption of empty string raises error."""
        with pytest.raises(ValueError, match="Cannot decrypt empty token"):
            decrypt("")
    
    def test_decrypt_invalid_token(self, temp_env_vars):
        """Test decryption of invalid token raises error."""
        with pytest.raises(ValueError, match="Invalid encryption key or token"):
            decrypt("invalid-token")
    
    def test_generate_key(self):
        """Test key generation."""
        key = generate_key()
        
        assert isinstance(key, str)
        assert len(key) > 0
        # Should be valid Fernet key
        Fernet(key.encode())
    
    def test_encrypt_api_keys(self, temp_env_vars):
        """Test API key encryption."""
        api_key = "test-api-key"
        secret_key = "test-secret-key"
        
        encrypted_api, encrypted_secret = encrypt_api_keys(api_key, secret_key)
        
        assert encrypted_api != api_key
        assert encrypted_secret != secret_key
        assert len(encrypted_api) > len(api_key)
        assert len(encrypted_secret) > len(secret_key)
    
    def test_decrypt_api_keys(self, temp_env_vars):
        """Test API key decryption."""
        api_key = "test-api-key"
        secret_key = "test-secret-key"
        
        encrypted_api, encrypted_secret = encrypt_api_keys(api_key, secret_key)
        decrypted_api, decrypted_secret = decrypt_api_keys(encrypted_api, encrypted_secret)
        
        assert decrypted_api == api_key
        assert decrypted_secret == secret_key
    
    def test_different_keys_produce_different_encryption(self, temp_env_vars):
        """Test that different keys produce different encrypted output."""
        data = "test-data"
        
        # Generate two different keys
        key1 = generate_key()
        key2 = generate_key()
        
        # Temporarily set different keys
        import os
        original_key = os.environ.get("SECRET_KEY")
        
        try:
            os.environ["SECRET_KEY"] = key1
            encrypted1 = encrypt(data)
            
            os.environ["SECRET_KEY"] = key2
            encrypted2 = encrypt(data)
            
            assert encrypted1 != encrypted2
        finally:
            if original_key:
                os.environ["SECRET_KEY"] = original_key
            else:
                os.environ.pop("SECRET_KEY", None)
    
    def test_fernet_instance_creation(self, temp_env_vars):
        """Test Fernet instance creation."""
        fernet = _fernet()
        assert isinstance(fernet, Fernet)
    
    def test_fernet_with_custom_key(self, temp_env_vars):
        """Test Fernet with custom key."""
        custom_key = generate_key()
        import os
        os.environ["SECRET_KEY"] = custom_key
        
        fernet = _fernet()
        assert isinstance(fernet, Fernet)
        
        # Test encryption/decryption with custom key
        test_data = "test-data"
        encrypted = fernet.encrypt(test_data.encode())
        decrypted = fernet.decrypt(encrypted).decode()
        
        assert decrypted == test_data


class TestSecureConfig:
    """Test secure configuration functionality."""
    
    def test_secure_config_initialization(self, temp_env_vars):
        """Test secure config initialization."""
        config = SecureConfig()
        assert config is not None
    
    def test_api_key_property(self, temp_env_vars):
        """Test API key property."""
        config = SecureConfig()
        api_key = config.api_key
        
        assert api_key == "test-alpaca-key"
    
    def test_secret_key_property(self, temp_env_vars):
        """Test secret key property."""
        config = SecureConfig()
        secret_key = config.secret_key
        
        assert secret_key == "test-alpaca-secret"
    
    def test_base_url_property(self, temp_env_vars):
        """Test base URL property."""
        config = SecureConfig()
        base_url = config.base_url
        
        assert base_url == "https://paper-api.alpaca.markets"
    
    def test_openai_api_key_property(self, temp_env_vars):
        """Test OpenAI API key property."""
        config = SecureConfig()
        openai_key = config.openai_api_key
        
        assert openai_key == "test-openai-key"
    
    def test_are_keys_configured(self, temp_env_vars):
        """Test keys configuration check."""
        config = SecureConfig()
        configured = config.are_keys_configured()
        
        assert configured is True
    
    def test_get_headers(self, temp_env_vars):
        """Test HTTP headers generation."""
        config = SecureConfig()
        headers = config.get_headers()
        
        expected_headers = {
            "APCA-API-KEY-ID": "test-alpaca-key",
            "APCA-API-SECRET-KEY": "test-alpaca-secret",
            "Content-Type": "application/json"
        }
        
        assert headers == expected_headers
    
    def test_get_headers_without_keys(self):
        """Test headers generation when keys are not configured."""
        config = SecureConfig()
        
        with pytest.raises(ValueError, match="API keys not configured"):
            config.get_headers()
    
    def test_encrypt_and_store_keys(self, temp_env_vars):
        """Test key encryption and storage."""
        config = SecureConfig()
        api_key = "new-api-key"
        secret_key = "new-secret-key"
        
        encrypted_api, encrypted_secret = config.encrypt_and_store_keys(api_key, secret_key)
        
        assert encrypted_api != api_key
        assert encrypted_secret != secret_key
        
        # Verify they can be decrypted
        decrypted_api, decrypted_secret = decrypt_api_keys(encrypted_api, encrypted_secret)
        assert decrypted_api == api_key
        assert decrypted_secret == secret_key
    
    def test_encrypted_keys_priority(self, temp_env_vars):
        """Test that encrypted keys take priority over plain text."""
        import os
        
        # Set both encrypted and plain text keys
        encrypted_api = encrypt("encrypted-api-key")
        encrypted_secret = encrypt("encrypted-secret-key")
        
        os.environ["ENCRYPTED_APCA_API_KEY_ID"] = encrypted_api
        os.environ["ENCRYPTED_APCA_API_SECRET_KEY"] = encrypted_secret
        os.environ["APCA_API_KEY_ID"] = "plain-text-key"
        os.environ["APCA_API_SECRET_KEY"] = "plain-text-secret"
        
        config = SecureConfig()
        
        # Should use encrypted keys
        assert config.api_key == "encrypted-api-key"
        assert config.secret_key == "encrypted-secret-key"
    
    def test_fallback_to_plain_text(self, temp_env_vars):
        """Test fallback to plain text when encrypted keys are not available."""
        import os
        
        # Remove encrypted keys, keep plain text
        os.environ.pop("ENCRYPTED_APCA_API_KEY_ID", None)
        os.environ.pop("ENCRYPTED_APCA_API_SECRET_KEY", None)
        os.environ["APCA_API_KEY_ID"] = "plain-text-key"
        os.environ["APCA_API_SECRET_KEY"] = "plain-text-secret"
        
        config = SecureConfig()
        
        # Should use plain text keys
        assert config.api_key == "plain-text-key"
        assert config.secret_key == "plain-text-secret"
    
    def test_get_secure_config_singleton(self, temp_env_vars):
        """Test that get_secure_config returns singleton instance."""
        config1 = get_secure_config()
        config2 = get_secure_config()
        
        assert config1 is config2


class TestSecurityIntegration:
    """Test security integration scenarios."""
    
    def test_full_encryption_workflow(self, temp_env_vars):
        """Test complete encryption workflow."""
        # Generate new keys
        api_key = "production-api-key"
        secret_key = "production-secret-key"
        
        # Encrypt keys
        encrypted_api, encrypted_secret = encrypt_api_keys(api_key, secret_key)
        
        # Store encrypted keys in environment
        import os
        os.environ["ENCRYPTED_APCA_API_KEY_ID"] = encrypted_api
        os.environ["ENCRYPTED_APCA_API_SECRET_KEY"] = encrypted_secret
        
        # Create config and verify it works
        config = SecureConfig()
        assert config.are_keys_configured()
        
        headers = config.get_headers()
        assert headers["APCA-API-KEY-ID"] == api_key
        assert headers["APCA-API-SECRET-KEY"] == secret_key
    
    def test_key_rotation(self, temp_env_vars):
        """Test key rotation scenario."""
        # Initial keys
        old_api_key = "old-api-key"
        old_secret_key = "old-secret-key"
        
        # Encrypt and store
        encrypted_api, encrypted_secret = encrypt_api_keys(old_api_key, old_secret_key)
        
        import os
        os.environ["ENCRYPTED_APCA_API_KEY_ID"] = encrypted_api
        os.environ["ENCRYPTED_APCA_API_SECRET_KEY"] = encrypted_secret
        
        # Verify old keys work
        config = SecureConfig()
        assert config.api_key == old_api_key
        
        # Rotate to new keys
        new_api_key = "new-api-key"
        new_secret_key = "new-secret-key"
        
        new_encrypted_api, new_encrypted_secret = encrypt_api_keys(new_api_key, new_secret_key)
        os.environ["ENCRYPTED_APCA_API_KEY_ID"] = new_encrypted_api
        os.environ["ENCRYPTED_APCA_API_SECRET_KEY"] = new_encrypted_secret
        
        # Verify new keys work
        config = SecureConfig()
        assert config.api_key == new_api_key
        assert config.secret_key == new_secret_key
    
    def test_invalid_encrypted_key_handling(self, temp_env_vars):
        """Test handling of invalid encrypted keys."""
        import os
        
        # Set invalid encrypted key
        os.environ["ENCRYPTED_APCA_API_KEY_ID"] = "invalid-encrypted-key"
        os.environ["APCA_API_KEY_ID"] = "fallback-key"
        
        config = SecureConfig()
        
        # Should fall back to plain text
        assert config.api_key == "fallback-key"
    
    def test_missing_encryption_key(self, temp_env_vars):
        """Test behavior when encryption key is missing."""
        import os
        
        # Remove encryption key
        os.environ.pop("SECRET_KEY", None)
        
        # Should still work with development key
        config = SecureConfig()
        assert config is not None
        
        # Should be able to encrypt/decrypt with development key
        test_data = "test-data"
        encrypted = encrypt(test_data)
        decrypted = decrypt(encrypted)
        assert decrypted == test_data

