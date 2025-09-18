#!/usr/bin/env python3
"""
Utility script to encrypt API keys for secure storage.

This script helps you encrypt your Alpaca and OpenAI API keys so they can be
safely stored in environment variables or configuration files.

Usage:
    python encrypt_keys.py
"""

import os
import sys
from app.core.encryption import generate_key, encrypt_api_keys, encrypt
from app.core.secure_config import setup_encrypted_keys


def main():
    print("🔐 Alpaca Trading App - API Key Encryption Utility")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("app/core/encryption.py"):
        print("❌ Error: Please run this script from the backend directory")
        sys.exit(1)
    
    print("\nThis utility will help you encrypt your API keys for secure storage.")
    print("You can choose to encrypt Alpaca keys, OpenAI key, or both.")
    
    # Generate a new encryption key if needed
    print(f"\n🔑 Current SECRET_KEY status: {'✅ Set' if os.getenv('SECRET_KEY') else '❌ Not set'}")
    
    if not os.getenv('SECRET_KEY'):
        print("\n⚠️  No SECRET_KEY found in environment.")
        print("For development, a key will be generated from SECRET_PASSPHRASE.")
        print("For production, you should set a persistent SECRET_KEY.")
        
        new_key = generate_key()
        print(f"\n🔑 Generated encryption key for production use:")
        print(f"SECRET_KEY={new_key}")
        print("\n⚠️  Save this key securely! You'll need it to decrypt your API keys.")
    
    print("\n" + "=" * 50)
    
    # Encrypt Alpaca API keys
    print("\n📡 Alpaca API Keys")
    encrypt_alpaca = input("Do you want to encrypt Alpaca API keys? (y/n): ").lower().strip() == 'y'
    
    if encrypt_alpaca:
        print("\nEnter your Alpaca API credentials:")
        api_key = input("API Key ID: ").strip()
        secret_key = input("Secret Key: ").strip()
        
        if api_key and secret_key:
            try:
                encrypted_api, encrypted_secret = encrypt_api_keys(api_key, secret_key)
                
                print("\n✅ Alpaca keys encrypted successfully!")
                print("\nAdd these to your .env file:")
                print(f"ENCRYPTED_APCA_API_KEY_ID={encrypted_api}")
                print(f"ENCRYPTED_APCA_API_SECRET_KEY={encrypted_secret}")
                print("\n⚠️  Remove or comment out the plain text versions:")
                print("# APCA_API_KEY_ID=your_plain_key")
                print("# APCA_API_SECRET_KEY=your_plain_secret")
                
            except Exception as e:
                print(f"❌ Error encrypting Alpaca keys: {e}")
        else:
            print("❌ Both API key and secret key are required")
    
    # Encrypt OpenAI API key
    print("\n" + "=" * 50)
    print("\n🤖 OpenAI API Key")
    encrypt_openai = input("Do you want to encrypt OpenAI API key? (y/n): ").lower().strip() == 'y'
    
    if encrypt_openai:
        openai_key = input("OpenAI API Key: ").strip()
        
        if openai_key:
            try:
                encrypted_openai = encrypt(openai_key)
                
                print("\n✅ OpenAI key encrypted successfully!")
                print("\nAdd this to your .env file:")
                print(f"ENCRYPTED_OPENAI_API_KEY={encrypted_openai}")
                print("\n⚠️  Remove or comment out the plain text version:")
                print("# OPENAI_API_KEY=your_plain_key")
                
            except Exception as e:
                print(f"❌ Error encrypting OpenAI key: {e}")
        else:
            print("❌ OpenAI API key is required")
    
    # Summary
    print("\n" + "=" * 50)
    print("\n📋 Summary")
    print("✅ Encryption complete!")
    print("\nNext steps:")
    print("1. Add the encrypted keys to your .env file")
    print("2. Set SECRET_KEY environment variable (for production)")
    print("3. Remove plain text API keys from .env file")
    print("4. Restart your application")
    
    print("\n🔒 Security Notes:")
    print("- Keep your SECRET_KEY secure and never commit it to version control")
    print("- Use different SECRET_KEY values for different environments")
    print("- Consider using a secrets management service for production")
    
    print("\n✨ Your API keys are now encrypted and secure!")


if __name__ == "__main__":
    main()
