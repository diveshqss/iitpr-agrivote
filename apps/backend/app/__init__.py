from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from .config import Config
from app.utils.db import init_db

bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize DB
    init_db(app)

    # Init bcrypt
    bcrypt.init_app(app)

    # Register routes
    from app.routes.auth_routes import auth_bp
    from app.routes.farmer_routes import farmer_bp
    from app.routes.expert_routes import expert_bp
    from app.routes.moderator_routes import moderator_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(farmer_bp, url_prefix="/api/farmer")
    app.register_blueprint(expert_bp, url_prefix="/api/expert")
    app.register_blueprint(moderator_bp, url_prefix="/api/moderator")

    return app