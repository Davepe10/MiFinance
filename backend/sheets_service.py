import os
from dotenv import load_dotenv
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Cargar variables de entorno
load_dotenv()

scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name(os.getenv("GOOGLE_CREDENTIALS_PATH"), scope)
client = gspread.authorize(creds)

# Accede al nombre de la hoja desde .env
sheet = client.open(os.getenv("GOOGLE_SHEETS_NAME")).sheet1

def save_transaction(data):
    try:
        row = [data['email'], data['type'], data['category'], data['amount'], data['description'], data['date']]
        sheet.append_row(row)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
