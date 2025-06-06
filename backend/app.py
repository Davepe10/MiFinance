from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import secrets
import bcrypt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import re

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["https://mi-finance.vercel.app"])


# Configuración de correo
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

mail = Mail(app)

# Configuración de Google Sheets
SCOPE = [
    "https://spreadsheets.google.com/feeds", 
    "https://www.googleapis.com/auth/drive" 
]
CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS_PATH")
creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, SCOPE)
client = gspread.authorize(creds)

SPREADSHEET_NAME = os.getenv("GOOGLE_SHEETS_NAME")
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

# Hojas de cálculo
usuarios_sheet = create_or_get_worksheet("Usuarios", 100, 5, ["nombre", "email", "password_hash", "token", "token_expiry"])
transacciones_sheet = create_or_get_worksheet("Transacciones", 1000, 6, ["email", "tipo", "categoria", "monto", "descripcion", "fecha"])
objetivos_sheet = create_or_get_worksheet("Objetivos", 1000, 7, ["email", "monto_objtivo", "monto_cuota", "descripcion", "fecha_inicio", "fecha_finalizacion", "alcanzado"])
historial_sheet = create_or_get_worksheet("HistorialObjetivos", 1000, 4, ["email", "descripcion", "monto", "fecha_alcanzado"])
gastos_fijos_sheet = create_or_get_worksheet("GastosFijos", 1000, 5, ["email", "categoria", "monto", "descripcion", "mes"])

# Validaciones
def is_valid_email(email):
    regex = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    return re.match(regex, email) is not None

def is_positive_number(value):
    try:
        return float(value) > 0
    except ValueError:
        return False

# Funciones auxiliares
def generate_token():
    return secrets.token_hex(16)

# Registro de usuarios
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    nombre = data.get("nombre", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not all([nombre, email, password]):
        return jsonify({"status": "error", "message": "Faltan campos obligatorios."}), 400
    if not is_valid_email(email):
        return jsonify({"status": "error", "message": "Formato de correo inválido."}), 400

    usuarios = usuarios_sheet.get_all_records()
    if any(u["email"].lower() == email for u in usuarios):
        return jsonify({"status": "error", "message": "El usuario ya está registrado."}), 400

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    token = generate_token()
    usuarios_sheet.append_row([nombre, email, password_hash, token, ""])
    return jsonify({"status": "success", "message": "Usuario registrado correctamente."})

# Inicio de sesión
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"status": "error", "message": "Faltan campos obligatorios."}), 400

    usuarios = usuarios_sheet.get_all_records()
    user = next((u for u in usuarios if u["email"].lower() == email), None)
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user["password_hash"].encode('utf-8')):
        return jsonify({"status": "error", "message": "Correo o contraseña incorrectos."}), 400

    token = generate_token()
    row = usuarios.index(user) + 2  # Índice real en la hoja
    usuarios_sheet.update_cell(row, 4, token)
    return jsonify({
        "status": "success",
        "message": "Inicio de sesión exitoso.",
        "token": token,
        "user": {"nombre": user["nombre"], "email": user["email"]}
    })

# Agregar transacción
@app.route('/add_transaction', methods=['POST'])
def add_transaccion():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    tipo = data.get("tipo", "").strip()
    categoria = data.get("categoria", "").strip()
    monto = data.get("monto")
    descripcion = data.get("descripcion", "").strip()
    fecha = data.get("fecha", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400
    if tipo not in ["ingreso", "gasto"]:
        return jsonify({"status": "error", "message": "Tipo debe ser 'ingreso' o 'gasto'."}), 400
    if not is_positive_number(monto):
        return jsonify({"status": "error", "message": "Monto debe ser un número positivo."}), 400

    transacciones_sheet.append_row([email, tipo, categoria, float(monto), descripcion, fecha])
    return jsonify({"status": "success", "message": "Transacción registrada correctamente."})

# Obtener transacciones
@app.route('/get_transacciones', methods=['GET'])
def get_transacciones():
    email = request.args.get("email", "").strip().lower()
    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400

    transacciones = transacciones_sheet.get_all_records()
    user_transacciones = [t for t in transacciones if t["email"].lower() == email]
    return jsonify({"status": "success", "transacciones": user_transacciones})

# Agregar objetivo
@app.route('/agregar_objetivo', methods=['POST'])
def agregar_objetivo():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    monto_objtivo = data.get("monto_objtivo")
    monto_cuota = data.get("monto_cuota", 0)
    descripcion = data.get("descripcion", "").strip()
    fecha_inicio = data.get("fecha_inicio", datetime.now().strftime("%Y-%m-%d"))
    fecha_finalizacion = data.get("fecha_finalizacion", "").strip()

    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400
    if not descripcion:
        return jsonify({"status": "error", "message": "Descripción es requerida."}), 400
    if not is_positive_number(monto_objtivo):
        return jsonify({"status": "error", "message": "Monto objetivo debe ser un número positivo."}), 400
    if not fecha_finalizacion:
        return jsonify({"status": "error", "message": "Fecha de finalización es requerida."}), 400

    objetivos_sheet.append_row([
        email,
        float(monto_objtivo),
        float(monto_cuota) if monto_cuota and is_positive_number(monto_cuota) else 0,
        descripcion,
        fecha_inicio,
        fecha_finalizacion,
        "no"
    ])
    return jsonify({"status": "success", "message": "Objetivo registrado correctamente."})

# Obtener objetivos
@app.route('/get_objetivos', methods=['GET'])
def get_objetivos():
    email = request.args.get("email", "").strip().lower()
    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400

    objetivos = objetivos_sheet.get_all_records()
    user_objetivos = [o for o in objetivos if o["email"].lower() == email]
    return jsonify({"status": "success", "objetivos": user_objetivos})

# Eliminar objetivo
@app.route('/eliminar_objetivo', methods=['DELETE'])
def eliminar_objetivo():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    descripcion = data.get("descripcion", "").strip()

    if not email or not descripcion:
        return jsonify({"status": "error", "message": "Datos incompletos."}), 400

    objetivos = objetivos_sheet.get_all_records()
    for idx, obj in enumerate(objetivos):
        if obj["email"].lower() == email and obj["descripcion"] == descripcion:
            objetivos_sheet.delete_rows(idx + 2)
            return jsonify({"status": "success", "message": "Objetivo eliminado correctamente."})
    return jsonify({"status": "error", "message": "Objetivo no encontrado."}), 404

# Marcar objetivo como alcanzado
@app.route('/marcar_alcanzado', methods=['PUT'])
def marcar_alcanzado():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    descripcion = data.get("descripcion", "").strip()

    if not email or not descripcion:
        return jsonify({"status": "error", "message": "Datos incompletos."}), 400

    objetivos = objetivos_sheet.get_all_records()
    for idx, obj in enumerate(objetivos):
        if obj["email"].lower() == email and obj["descripcion"] == descripcion:
            objetivos_sheet.update_cell(idx + 2, 7, "si")
            historial_sheet.append_row([email, descripcion, obj["monto_objtivo"], datetime.now().strftime("%Y-%m-%d")])
            return jsonify({"status": "success", "message": "Objetivo marcado como alcanzado."})
    return jsonify({"status": "error", "message": "Objetivo no encontrado."}), 404

# Agregar gasto fijo
@app.route('/agregar_gasto_fijo', methods=['POST'])
def agregar_gasto_fijo():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    categoria = data.get("categoria", "").strip()
    monto = data.get("monto")
    descripcion = data.get("descripcion", "").strip()
    mes = data.get("mes", "").strip()

    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400
    if not categoria or not descripcion or not mes:
        return jsonify({"status": "error", "message": "Todos los campos son obligatorios."}), 400
    if not is_positive_number(monto):
        return jsonify({"status": "error", "message": "Monto debe ser un número positivo."}), 400

    gastos_fijos_sheet.append_row([email, categoria, float(monto), descripcion, mes])
    return jsonify({"status": "success", "message": "Gasto fijo registrado correctamente."})

# Obtener gastos fijos
@app.route('/gastos_fijos', methods=['GET'])
def get_gastos_fijos():
    email = request.args.get("email", "").strip().lower()
    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400

    gastos_fijos = gastos_fijos_sheet.get_all_records()
    user_gastos_fijos = [gf for gf in gastos_fijos if gf["email"].lower() == email]
    return jsonify({"status": "success", "gastos_fijos": user_gastos_fijos})

# Eliminar gasto fijo
@app.route('/eliminar_gasto_fijo', methods=['DELETE'])
def eliminar_gasto_fijo():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    categoria = data.get("categoria", "").strip()
    mes = data.get("mes", "").strip()

    if not email or not categoria or not mes:
        return jsonify({"status": "error", "message": "Datos incompletos."}), 400

    gastos_fijos = gastos_fijos_sheet.get_all_records()
    for idx, gf in enumerate(gastos_fijos):
        if gf["email"].lower() == email and gf["categoria"] == categoria and gf["mes"] == mes:
            gastos_fijos_sheet.delete_rows(idx + 2)
            return jsonify({"status": "success", "message": "Gasto fijo eliminado correctamente."})
    return jsonify({"status": "error", "message": "Gasto fijo no encontrado."}), 404

@app.route('/marcar_cuota', methods=['PUT'])
def marcar_cuota():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    descripcion = data.get('descripcion', '').strip()
    cuotas_pagadas = data.get('cuotas_pagadas', 0)

    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400
    if not descripcion:
        return jsonify({"status": "error", "message": "Descripción requerida."}), 400
    if not isinstance(cuotas_pagadas, int) or cuotas_pagadas < 0:
        return jsonify({"status": "error", "message": "Número de cuotas pagadas inválido."}), 400

    try:
        # Buscar el objetivo en la hoja de cálculo
        all_objetivos = objetivos_sheet.get_all_records()
        for obj in all_objetivos:
            if obj['email'] == email and obj['descripcion'] == descripcion:
                # Actualizar el número de cuotas pagadas
                row_number = all_objetivos.index(obj) + 2  # Fila real en la hoja (índice + 2)
                objetivos_sheet.update_cell(row_number, 7, cuotas_pagadas)  # Columna 7: cuotas_pagadas
                return jsonify({"status": "success", "message": "Cuota marcada correctamente."})

        return jsonify({"status": "error", "message": "Objetivo no encontrado."}), 404
    except Exception as e:
        print(f"Error al marcar cuota: {e}")
        return jsonify({"status": "error", "message": "Error interno del servidor."}), 500

if __name__ == '__main__':
    app.run(debug=True)