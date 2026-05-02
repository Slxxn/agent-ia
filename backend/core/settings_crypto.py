"""
Chiffrement symétrique des valeurs sensibles (clés API) stockées en SQLite.
Utilise Fernet (cryptography) si disponible, sinon base64 simple.
La clé est générée une fois et persistée dans backend/db/.settings_key.
"""
import base64
import os

_KEY_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "db", ".settings_key")


def _get_key() -> bytes:
    if os.path.exists(_KEY_FILE):
        with open(_KEY_FILE, "rb") as f:
            return f.read(32)
    import secrets
    key = secrets.token_bytes(32)
    os.makedirs(os.path.dirname(_KEY_FILE), exist_ok=True)
    with open(_KEY_FILE, "wb") as f:
        f.write(key)
    return key


try:
    from cryptography.fernet import Fernet as _Fernet

    def _fernet() -> _Fernet:
        return _Fernet(base64.urlsafe_b64encode(_get_key()))

    def encrypt_value(value: str) -> str:
        return _fernet().encrypt(value.encode()).decode()

    def decrypt_value(token: str) -> str:
        return _fernet().decrypt(token.encode()).decode()

except ImportError:
    def encrypt_value(value: str) -> str:
        return base64.urlsafe_b64encode(value.encode()).decode()

    def decrypt_value(token: str) -> str:
        return base64.urlsafe_b64decode(token.encode()).decode()
