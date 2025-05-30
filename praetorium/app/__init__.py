from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.routes.auth_routes import auth_bp
from app.routes.project_routes import projects_bp
import os


def create_app():
    app = Flask(__name__)

    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY")
    JWTManager(app)

    # Register the auth blueprint
    app.register_blueprint(auth_bp, url_prefix="/auth")

    # Register the projects blueprint
    app.register_blueprint(projects_bp, url_prefix="/projects")

    # Example route for testing
    @app.route("/")
    def home():
        return "Welcome to PraetorAI!"

    return app
