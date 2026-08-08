from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
from flask import send_from_directory
from flask_cors import CORS
import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from chatbot import chatbot_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(chatbot_bp)

# -------------------------------------------------
# DATABASE
# -------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database.db"
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'patient'
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            name TEXT,
            age INTEGER,
            gender TEXT,
            blood_group TEXT,
            city TEXT DEFAULT 'Vadodara',
            home_address TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    #patient table
    conn.execute("""
    CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        medicine_name TEXT NOT NULL,
        dosage TEXT,
        medicine_time TEXT,
        start_date TEXT,
        frequency TEXT DEFAULT 'Daily',
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
""")

    conn.execute("""
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        doctor_name TEXT NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'Booked',
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
""")

    conn.commit()
    conn.close()


create_tables()


# -------------------------------------------------
# HOME / TEST
# -------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "MediCare AI backend is running!"
    })


# -------------------------------------------------
# REGISTER
# -------------------------------------------------

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "patient").strip().lower()

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password are required."
        }), 400

    if role not in ["patient", "doctor"]:
        return jsonify({
            "status": "error",
            "message": "Role must be patient or doctor."
        }), 400

    conn = get_db()

    existing_user = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing_user:
        conn.close()
        return jsonify({
            "status": "error",
            "message": "User already exists."
        }), 409

    hashed_password = generate_password_hash(password)

    cursor = conn.execute(
        "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
        (email, hashed_password, role)
    )

    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "message": "Account created successfully. Please login.",
        "user": {
            "id": user_id,
            "email": email,
            "role": role
        }
    }), 201


# -------------------------------------------------
# LOGIN
# -------------------------------------------------

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Please enter both Email and Password."
        }), 400

    conn = get_db()

    user = conn.execute(
        "SELECT id, email, password, role FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    conn.close()

    if not user:
        return jsonify({
            "status": "error",
            "message": "Invalid email or password."
        }), 401

    if not check_password_hash(user["password"], password):
        return jsonify({
            "status": "error",
            "message": "Invalid email or password."
        }), 401

    return jsonify({
        "status": "success",
        "message": "Login successful!",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200


# -------------------------------------------------
# PROFILE
# -------------------------------------------------

@app.route("/api/profile", methods=["POST"])
def save_profile():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    name = data.get("name", "").strip()
    age = data.get("age")
    gender = data.get("gender")
    blood_group = data.get("blood_group")
    city = data.get("city", "Vadodara")
    home_address = data.get("home_address")

    if not email or not name or age is None:
        return jsonify({
            "status": "error",
            "message": "Email, name and age are required."
        }), 400

    conn = get_db()

    user = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if not user:
        conn.close()
        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    conn.execute("""
        INSERT INTO patients
        (user_id, name, age, gender, blood_group, city, home_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            name = excluded.name,
            age = excluded.age,
            gender = excluded.gender,
            blood_group = excluded.blood_group,
            city = excluded.city,
            home_address = excluded.home_address
    """, (
        user["id"],
        name,
        int(age),
        gender,
        blood_group,
        city,
        home_address
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "message": "Profile saved successfully."
    }), 200


# -------------------------------------------------
# GET PROFILE
# -------------------------------------------------

@app.route("/api/profile/<email>", methods=["GET"])
def get_profile(email):
    email = email.strip().lower()

    conn = get_db()

    row = conn.execute("""
        SELECT
            u.id,
            u.email,
            u.role,
            p.name,
            p.age,
            p.gender,
            p.blood_group,
            p.city,
            p.home_address
        FROM users u
        LEFT JOIN patients p ON p.user_id = u.id
        WHERE u.email = ?
    """, (email,)).fetchone()

    conn.close()

    if not row:
        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    return jsonify({
        "status": "success",
        "profile": dict(row)
    }), 200
# -------------------------------------------------
# CHANGE PASSWORD
# -------------------------------------------------

@app.route("/api/change-password", methods=["POST"])
def change_password():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")

    if not email or not current_password or not new_password:
        return jsonify({
            "status": "error",
            "message": "All password fields are required."
        }), 400

    if len(new_password) < 6:
        return jsonify({
            "status": "error",
            "message": "New password must contain at least 6 characters."
        }), 400

    conn = get_db()

    user = conn.execute(
        "SELECT id, password FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if not user:
        conn.close()

        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    # Check old password
    if not check_password_hash(
        user["password"],
        current_password
    ):
        conn.close()

        return jsonify({
            "status": "error",
            "message": "Current password is incorrect."
        }), 401

    # Hash new password
    new_hashed_password = generate_password_hash(
        new_password
    )

    conn.execute(
        "UPDATE users SET password = ? WHERE id = ?",
        (new_hashed_password, user["id"])
    )

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "message": "Password changed successfully."
    }), 200


# GET APPOINTMENTS
@app.route("/api/appointments", methods=["GET"])
def get_appointments():

    conn = get_db()

    appointments = conn.execute("""
        SELECT *
        FROM appointments
        WHERE status = 'Upcoming'
        ORDER BY appointment_date, appointment_time
    """).fetchall()

    conn.close()

    return jsonify({
        "status": "success",
        "appointments": [dict(row) for row in appointments]
    }), 200


# CANCEL APPOINTMENT
@app.route("/api/appointments/<int:appointment_id>", methods=["DELETE"])
def cancel_appointment(appointment_id):

    conn = get_db()

    appointment = conn.execute("""
        SELECT id
        FROM appointments
        WHERE id = ?
    """, (appointment_id,)).fetchone()

    if not appointment:
        conn.close()

        return jsonify({
            "status": "error",
            "message": "Appointment not found."
        }), 404

    conn.execute("""
        UPDATE appointments
        SET status = 'Cancelled'
        WHERE id = ?
    """, (appointment_id,))

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "message": "Appointment cancelled successfully."
    }), 200
# -------------------------------------------------
# ADD MEDICINE
# -------------------------------------------------

@app.route("/api/medicines", methods=["POST"])
def add_medicine():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    medicine_name = data.get("medicine_name", "").strip()
    dosage = data.get("dosage", "").strip()
    medicine_time = data.get("medicine_time", "").strip()
    start_date = data.get("start_date", "").strip()
    frequency = data.get("frequency", "Daily").strip()

    if not email or not medicine_name:
        return jsonify({
            "status": "error",
            "message": "Email and medicine name are required."
        }), 400

    conn = get_db()

    user = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if not user:
        conn.close()

        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    cursor = conn.execute("""
        INSERT INTO medicines
        (user_id, medicine_name, dosage, medicine_time, start_date, frequency)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        user["id"],
        medicine_name,
        dosage,
        medicine_time,
        start_date,
        frequency
    ))

    medicine_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "message": "Medicine added successfully.",
        "medicine_id": medicine_id
    }), 201


# -------------------------------------------------
# GET MEDICINES
# -------------------------------------------------

@app.route("/api/medicines/<email>", methods=["GET"])
def get_medicines(email):

    email = email.strip().lower()

    conn = get_db()

    rows = conn.execute("""
        SELECT
            m.id,
            m.medicine_name,
            m.dosage,
            m.medicine_time,
            m.start_date,
            m.frequency
        FROM medicines m
        JOIN users u ON u.id = m.user_id
        WHERE u.email = ?
        ORDER BY m.medicine_time
    """, (email,)).fetchall()

    conn.close()

    return jsonify({
        "status": "success",
        "medicines": [dict(row) for row in rows]
    }), 200



# -------------------------------------------------
# APPOINTMENTS
# -------------------------------------------------

@app.route("/api/appointments", methods=["POST"])
def add_appointment():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    doctor_name = data.get("doctor_name", "").strip()
    appointment_date = data.get("appointment_date", "").strip()
    appointment_time = data.get("appointment_time", "").strip()
    reason = data.get("reason", "").strip()

    if not email or not doctor_name or not appointment_date or not appointment_time:
        return jsonify({
            "status": "error",
            "message": "Please fill all required appointment details."
        }), 400

    conn = get_db()

    user = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if not user:
        conn.close()

        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    cursor = conn.execute("""
        INSERT INTO appointments
        (
            user_id,
            doctor_name,
            appointment_date,
            appointment_time,
            reason,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        user["id"],
        doctor_name,
        appointment_date,
        appointment_time,
        reason,
        "Booked"
    ))

    appointment_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "message": "Appointment booked successfully.",
        "appointment_id": appointment_id
    }), 201
# -------------------------------------------------
# GET APPOINTMENTS FOR USER
# -------------------------------------------------

@app.route("/api/appointments/<email>", methods=["GET"])
def get_user_appointments(email):

    email = email.strip().lower()

    conn = get_db()

    rows = conn.execute("""
        SELECT
            a.id,
            a.doctor_name,
            a.appointment_date,
            a.appointment_time,
            a.reason,
            a.status
        FROM appointments a
        JOIN users u
            ON u.id = a.user_id
        WHERE u.email = ?
        ORDER BY a.appointment_date, a.appointment_time
    """, (email,)).fetchall()

    conn.close()

    return jsonify({
        "status": "success",
        "appointments": [dict(row) for row in rows]
    }), 200



# -------------------------------------------------
# CANCEL APPOINTMENT
# -------------------------------------------------

@app.route("/api/appointments/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):

    conn = get_db()

    appointment = conn.execute(
        "SELECT id FROM appointments WHERE id = ?",
        (appointment_id,)
    ).fetchone()

    if not appointment:
        conn.close()

        return jsonify({
            "status": "error",
            "message": "Appointment not found."
        }), 404

    conn.execute(
        "DELETE FROM appointments WHERE id = ?",
        (appointment_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "message": "Appointment cancelled successfully."
    }), 200
# -------------------------------------------------
# DELETE MEDICINE
# -------------------------------------------------

@app.route("/api/medicines/<int:medicine_id>", methods=["DELETE"])
def delete_medicine(medicine_id):

    conn = get_db()

    medicine = conn.execute(
        "SELECT id FROM medicines WHERE id = ?",
        (medicine_id,)
    ).fetchone()

    if not medicine:
        conn.close()

        return jsonify({
            "status": "error",
            "message": "Medicine not found."
        }), 404

    conn.execute(
        "DELETE FROM medicines WHERE id = ?",
        (medicine_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "message": "Medicine deleted successfully."
    }), 200

# -------------------------------------------------
# RECORDS - UPLOAD REPORT
# -------------------------------------------------

@app.route("/api/records/upload", methods=["POST"])
def upload_record():

    if "report" not in request.files:
        return jsonify({
            "status": "error",
            "message": "No report file selected."
        }), 400

    file = request.files["report"]

    if file.filename == "":
        return jsonify({
            "status": "error",
            "message": "Please select a report."
        }), 400

    allowed_extensions = {
        "pdf",
        "jpg",
        "jpeg",
        "png"
    }

    filename = secure_filename(file.filename)

    if "." not in filename:
        return jsonify({
            "status": "error",
            "message": "Invalid file."
        }), 400

    extension = filename.rsplit(".", 1)[1].lower()

    if extension not in allowed_extensions:
        return jsonify({
            "status": "error",
            "message": "Only PDF, JPG, JPEG and PNG files are allowed."
        }), 400

    file.save(UPLOAD_FOLDER / filename)

    return jsonify({
        "status": "success",
        "message": "Report uploaded successfully.",
        "filename": filename,
        "url": f"/uploads/{filename}"
    }), 201



# -------------------------------------------------
# OPEN UPLOADED REPORT
# -------------------------------------------------

@app.route("/uploads/<filename>")
def uploaded_file(filename):

    return send_from_directory(
        str(UPLOAD_FOLDER),
        filename
    )


# -------------------------------------------------
# RECORDS - GET UPLOADED REPORTS
# -------------------------------------------------

@app.route("/api/records", methods=["GET"])
def get_records():

    if not UPLOAD_FOLDER.exists():
        return jsonify([])

    records = []

    for file in UPLOAD_FOLDER.iterdir():

        if file.is_file():

            records.append({
                "filename": file.name,
                "url": f"/uploads/{file.name}"
            })

    return jsonify(records)


# -------------------------------------------------
# RUN SERVER
# -------------------------------------------------

if __name__ == "__main__":
    print("======================================")
    print("   MediCare AI Backend")
    print("   http://127.0.0.1:5000")
    print("======================================")
    app.run(debug=True, port=5000)

