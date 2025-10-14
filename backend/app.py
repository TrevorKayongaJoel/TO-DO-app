

import os
import datetime
import jwt
from functools import wraps
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-access-token')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Ensure instance folder exists
if not os.path.exists('instance'):
    os.makedirs('instance')

instance_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)

app.config['SECRET_KEY'] = 'your-secret-key' # Change this to a random secret key
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(instance_path, 'tasks.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Flask-Mail configuration
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT') or 587)
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS') is not None
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

db = SQLAlchemy(app)
mail = Mail(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(500), default="")
    completed = db.Column(db.Boolean, default=False)
    position = db.Column(db.Integer, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    important = db.Column(db.Boolean, default=False, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "position": self.position,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "important": self.important
        }

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['id'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not username or not password or not email:
        return jsonify({"error": "Username, email, and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    try:
        msg = Message("Welcome to To-Do App!", recipients=[email])
        msg.html = f"<h1>Welcome, {username}!</h1><p>Thank you for registering.</p>"
        mail.send(msg)
    except Exception as e:
        # Log the error and don't block the registration process
        app.logger.error(f"Error sending email: {e}")

    return jsonify(new_user.to_dict()), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid username or password"}), 401

    token = jwt.encode({
        'id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token})

@app.route("/api/user", methods=["GET"])
@token_required
def get_user(current_user):
    return jsonify(current_user.to_dict())

@app.route("/tasks", methods=["GET"])
@token_required
def get_tasks(current_user):
    tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.position.asc()).all()
    return jsonify([t.to_dict() for t in tasks])

@app.route("/tasks", methods=["POST"])
@token_required
def create_task(current_user):
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    due_date_str = data.get("due_date")
    important = data.get("important", False)

    if not title:
        return jsonify({"error": "Title is required"}), 400

    due_date = None
    if due_date_str:
        try:
            due_date = datetime.datetime.strptime(due_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    max_pos = db.session.query(db.func.max(Task.position)).filter_by(user_id=current_user.id).scalar()
    next_pos = (max_pos or 0) + 1

    t = Task(
        title=title, 
        description=description, 
        completed=False, 
        position=next_pos, 
        user_id=current_user.id,
        due_date=due_date,
        important=important
    )
    db.session.add(t)
    db.session.commit()
    return jsonify(t.to_dict()), 201

@app.route("/tasks/<int:task_id>", methods=["PUT"])
@token_required
def update_task(current_user, task_id):
    t = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    data = request.get_json() or {}
    if "title" in data:
        t.title = data["title"].strip() or t.title
    if "description" in data:
        t.description = data["description"]
    if "completed" in data:
        t.completed = bool(data["completed"])
    if "position" in data:
        t.position = int(data["position"])
    if "important" in data:
        t.important = bool(data["important"])
    if "due_date" in data:
        due_date_str = data.get("due_date")
        if due_date_str:
            try:
                t.due_date = datetime.datetime.strptime(due_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        else:
            t.due_date = None
    db.session.commit()
    return jsonify(t.to_dict())

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
@token_required
def delete_task(current_user, task_id):
    t = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    db.session.delete(t)
    db.session.commit()
    repack_positions(current_user.id)
    return jsonify({"message": "Deleted"})

@app.route("/tasks/reorder", methods=["PUT"])
@token_required
def reorder_tasks(current_user):
    data = request.get_json() or {}
    new_order = data.get("order")
    if not isinstance(new_order, list):
        return jsonify({"error": "Order list required"}), 400

    for idx, task_id in enumerate(new_order, start=1):
        t = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
        if t:
            t.position = idx
    db.session.commit()
    return jsonify({"message": "Reordered"})

def repack_positions(user_id):
    tasks = Task.query.filter_by(user_id=user_id).order_by(Task.position.asc(), Task.id.asc()).all()
    for idx, t in enumerate(tasks, start=1):
        t.position = idx
    db.session.commit()

@app.cli.command("init-db")
def init_db_command():
    """Creates the database tables."""
    db.create_all()
    print("Initialized the database.")

if __name__ == "__main__":
    app.run(debug=True)

