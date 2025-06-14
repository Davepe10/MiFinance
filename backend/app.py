# src/app.py
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
import math

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
objetivos_sheet = create_or_get_worksheet("Objetivos", 1000, 8, ["email", "monto_objtivo", "monto_cuota", "descripcion", "fecha_inicio", "fecha_finalizacion", "cuotas_pagadas", "cuotas_totales"])
historial_sheet = create_or_get_worksheet("HistorialObjetivos", 1000, 4, ["email", "descripcion", "monto", "fecha_alcanzado"])
gastos_fijos_sheet = create_or_get_worksheet("GastosFijos", 1000, 5, ["email", "categoria", "monto", "descripcion", "mes"])
ahorro_sheet = create_or_get_worksheet("Ahorro", 1000, 2, ["email", "monto"])

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
    token_expiry = datetime.now() + timedelta(hours=1)
    usuarios_sheet.append_row([nombre, email, password_hash, token, token_expiry.strftime("%Y-%m-%d %H:%M:%S")])
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
    token_expiry = datetime.now() + timedelta(hours=1)
    row = usuarios.index(user) + 2  # Índice real en la hoja
    usuarios_sheet.update_cell(row, 4, token)
    usuarios_sheet.update_cell(row, 5, token_expiry.strftime("%Y-%m-%d %H:%M:%S"))
    return jsonify({
        "status": "success",
        "message": "Inicio de sesión exitoso.",
        "token": token,
        "user": {"nombre": user["nombre"], "email": user["email"]}
    })

# Verificar contraseña
@app.route('/verificar_contraseña', methods=['POST'])
def verificar_contraseña():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"status": "error", "message": "Faltan campos obligatorios."}), 400
    usuarios = usuarios_sheet.get_all_records()
    user = next((u for u in usuarios if u["email"].lower() == email), None)
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user["password_hash"].encode('utf-8')):
        return jsonify({"status": "error", "valid": False})
    return jsonify({"status": "success", "valid": True})

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

# Editar transacción
@app.route('/edit_transaction', methods=['PUT'])
def edit_transaction():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    transaccion_id = data.get("transaccion_id")
    tipo = data.get("tipo", "").strip()
    categoria = data.get("categoria", "").strip()
    monto = data.get("monto")
    descripcion = data.get("descripcion", "").strip()
    fecha = data.get("fecha", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400
    if not transaccion_id:
        return jsonify({"status": "error", "message": "ID de transacción es requerido."}), 400
    if tipo not in ["ingreso", "gasto"]:
        return jsonify({"status": "error", "message": "Tipo debe ser 'ingreso' o 'gasto'."}), 400
    if not is_positive_number(monto):
        return jsonify({"status": "error", "message": "Monto debe ser un número positivo."}), 400
    
    transacciones = transacciones_sheet.get_all_records()
    for idx, t in enumerate(transacciones):
        if t["email"].lower() == email and idx + 2 == transaccion_id:
            row_number = idx + 2  # Índice real en la hoja (índice + 2)
            transacciones_sheet.update_cell(row_number, 2, tipo)
            transacciones_sheet.update_cell(row_number, 3, categoria)
            transacciones_sheet.update_cell(row_number, 4, float(monto))
            transacciones_sheet.update_cell(row_number, 5, descripcion)
            transacciones_sheet.update_cell(row_number, 6, fecha)
            return jsonify({"status": "success", "message": "Transacción editada correctamente."})
    return jsonify({"status": "error", "message": "Transacción no encontrada."}), 404

# Agregar objetivo
@app.route('/agregar_objetivo', methods=['POST'])
def agregar_objetivo():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    monto_objtivo = data.get("monto_objtivo")
    monto_cuota = data.get("monto_cuota", 0)
    descripcion = data.get("descripcion", "").strip()
    fecha_finalizacion = data.get("fecha_finalizacion", "").strip()
    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400
    if not descripcion:
        return jsonify({"status": "error", "message": "Descripción es requerida."}), 400
    if not is_positive_number(monto_objtivo):
        return jsonify({"status": "error", "message": "Monto objetivo debe ser un número positivo."}), 400
    if not fecha_finalizacion:
        return jsonify({"status": "error", "message": "Fecha de finalización es requerida."}), 400
    fecha_inicio = datetime.now().strftime("%Y-%m-%d")
    cuotas_totales = math.ceil(float(monto_objtivo) / float(monto_cuota)) if float(monto_cuota) > 0 else 1
    objetivos_sheet.append_row([
        email,
        float(monto_objtivo),
        float(monto_cuota) if monto_cuota and is_positive_number(monto_cuota) else 0,
        descripcion,
        fecha_inicio,
        fecha_finalizacion,
        0,  # cuotas_pagadas
        cuotas_totales
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

# Marcar cuota
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
                cuotas_totales = obj['cuotas_totales']
                if cuotas_pagadas >= cuotas_totales:
                    historial_sheet.append_row([email, descripcion, obj["monto_objtivo"], datetime.now().strftime("%Y-%m-%d")])
                    objetivos_sheet.delete_rows(row_number)
                return jsonify({"status": "success", "message": "Cuota marcada correctamente."})
        return jsonify({"status": "error", "message": "Objetivo no encontrado."}), 404
    except Exception as e:
        print(f"Error al marcar cuota: {e}")
        return jsonify({"status": "error", "message": "Error interno del servidor."}), 500

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

# Editar gasto fijo
@app.route('/editar_gasto_fijo', methods=['PUT'])
def editar_gasto_fijo():
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
    
    gastos_fijos = gastos_fijos_sheet.get_all_records()
    for idx, gf in enumerate(gastos_fijos):
        if gf["email"].lower() == email and gf["categoria"] == categoria and gf["mes"] == mes:
            row_number = idx + 2  # Índice real en la hoja (índice + 2)
            gastos_fijos_sheet.update_cell(row_number, 3, float(monto))
            gastos_fijos_sheet.update_cell(row_number, 4, descripcion)
            return jsonify({"status": "success", "message": "Gasto fijo editado correctamente."})
    return jsonify({"status": "error", "message": "Gasto fijo no encontrado."}), 404

# Agregar ahorro
@app.route('/agregar_ahorro', methods=['POST'])
def agregar_ahorro():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    monto = data.get("monto")
    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400
    if not is_positive_number(monto):
        return jsonify({"status": "error", "message": "Monto debe ser un número positivo."}), 400
    ahorro = ahorro_sheet.get_all_records()
    user_ahorro = next((a for a in ahorro if a["email"].lower() == email), None)
    if user_ahorro:
        row_number = ahorro.index(user_ahorro) + 2  # Índice real en la hoja (índice + 2)
        nuevo_monto = float(user_ahorro["monto"]) + float(monto)
        ahorro_sheet.update_cell(row_number, 2, nuevo_monto)
    else:
        ahorro_sheet.append_row([email, float(monto)])
    return jsonify({"status": "success", "message": "Monto de ahorro guardado correctamente."})

# Obtener ahorro
@app.route('/get_ahorro', methods=['GET'])
def get_ahorro():
    email = request.args.get("email", "").strip().lower()
    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400
    ahorro = ahorro_sheet.get_all_records()
    user_ahorro = next((a for a in ahorro if a["email"].lower() == email), None)
    if user_ahorro:
        return jsonify({"status": "success", "ahorro": {"monto": user_ahorro["monto"]}})
    return jsonify({"status": "success", "ahorro": {"monto": 0}})

# Editar ahorro
@app.route('/editar_ahorro', methods=['PUT'])
def editar_ahorro():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    monto = data.get("monto")
    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400
    if not is_positive_number(monto):
        return jsonify({"status": "error", "message": "Monto debe ser un número positivo."}), 400
    ahorro = ahorro_sheet.get_all_records()
    user_ahorro = next((a for a in ahorro if a["email"].lower() == email), None)
    if user_ahorro:
        row_number = ahorro.index(user_ahorro) + 2  # Índice real en la hoja (índice + 2)
        ahorro_sheet.update_cell(row_number, 2, float(monto))
    else:
        ahorro_sheet.append_row([email, float(monto)])
    return jsonify({"status": "success", "message": "Monto de ahorro editado correctamente."})

# Retirar ahorro
@app.route('/retirar_ahorro', methods=['PUT'])
def retirar_ahorro():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    monto = data.get("monto")
    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400
    if not is_positive_number(monto):
        return jsonify({"status": "error", "message": "Monto debe ser un número positivo."}), 400
    ahorro = ahorro_sheet.get_all_records()
    user_ahorro = next((a for a in ahorro if a["email"].lower() == email), None)
    if not user_ahorro:
        return jsonify({"status": "error", "message": "No hay ahorro disponible."}), 400
    if float(monto) > float(user_ahorro["monto"]):
        return jsonify({"status": "error", "message": "El monto a retirar no puede ser mayor al monto ahorrado."}), 400
    row_number = ahorro.index(user_ahorro) + 2  # Índice real en la hoja (índice + 2)
    nuevo_monto = float(user_ahorro["monto"]) - float(monto)
    ahorro_sheet.update_cell(row_number, 2, nuevo_monto)
    transacciones_sheet.append_row([email, "gasto", "Retiro de Ahorro", float(monto), "Retiro de ahorro", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    return jsonify({"status": "success", "message": "Monto retirado correctamente."})

# Exportar datos
@app.route('/export_data', methods=['GET'])
def export_data():
    email = request.args.get("email", "").strip().lower()
    if not email or not is_valid_email(email):
        return jsonify({"status": "error", "message": "Email inválido."}), 400
    transacciones = transacciones_sheet.get_all_records()
    objetivos = objetivos_sheet.get_all_records()
    gastos_fijos = gastos_fijos_sheet.get_all_records()
    ahorro = ahorro_sheet.get_all_records()
    
    user_transacciones = [t for t in transacciones if t["email"].lower() == email]
    user_objetivos = [o for o in objetivos if o["email"].lower() == email]
    user_gastos_fijos = [gf for gf in gastos_fijos if gf["email"].lower() == email]
    user_ahorro = next((a for a in ahorro if a["email"].lower() == email), None)
    
    user_data = {
        "transacciones": user_transacciones,
        "objetivos": user_objetivos,
        "gastos_fijos": user_gastos_fijos,
        "ahorro": user_ahorro if user_ahorro else {"email": email, "monto": 0}
    }
    
    return jsonify({"status": "success", "data": user_data})

if __name__ == '__main__':
    app.run(debug=True)