import re
import secrets
import bcrypt
from datetime import datetime

def is_valid_email(email):
    regex = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    return re.match(regex, email) is not None

def is_positive_number(value):
    try:
        return float(value) > 0
    except ValueError:
        return False

def generate_token():
    return secrets.token_hex(16)

def bcrypt_hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def send_recovery_email(email, reset_link):
    # Implementación para enviar correos de recuperación
    pass



