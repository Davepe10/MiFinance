import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración de Google Sheets
SCOPE = [
    "https://spreadsheets.google.com/feeds", 
    "https://www.googleapis.com/auth/drive" 
]

CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS_PATH")  # Ruta al archivo JSON de credenciales
SPREADSHEET_NAME = os.getenv("GOOGLE_SHEETS_NAME")

def get_gspread_client():
    credentials = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, SCOPE)
    return gspread.authorize(credentials)

# Nombres de las hojas
USUARIOS_SHEET_NAME = "Usuarios"
TRANSACCIONES_SHEET_NAME = "Transacciones"
OBJETIVOS_SHEET_NAME = "Objetivos"
HISTORIAL_OBJETIVOS_SHEET_NAME = "HistorialObjetivos"

# Cliente y hoja de cálculo global
client = get_gspread_client()
try:
    spreadsheet = client.open(SPREADSHEET_NAME)
except gspread.exceptions.SpreadsheetNotFound:
    spreadsheet = client.create(SPREADSHEET_NAME)

def create_or_get_worksheet(title, rows, cols, headers):
    """Crea o obtiene una hoja de cálculo con los encabezados dados."""
    try:
        sheet = spreadsheet.worksheet(title)
    except gspread.exceptions.WorksheetNotFound:
        sheet = spreadsheet.add_worksheet(title=title, rows=rows, cols=cols)
        sheet.append_row(headers)
    return sheet