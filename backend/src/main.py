"""
Omniful Partner Portal - Main Application
"""
from flask import Flask, jsonify
from flask_cors import CORS
from src.models.database import db, init_db
from src.routes import auth, users, companies, deals, targets
import os

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')
    # Use absolute path for database in container
    db_path = os.path.join(os.getcwd(), 'src', 'database', 'app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize database
    db.init_app(app)
    
    # Create tables and initialize data
    with app.app_context():
        init_db()
    
    # Register blueprints
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(users.bp, url_prefix='/api/users')
    app.register_blueprint(companies.bp, url_prefix='/api/companies')
    app.register_blueprint(deals.bp, url_prefix='/api/deals')
    app.register_blueprint(targets.bp, url_prefix='/api/targets')
    
    # Health check endpoint
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'healthy', 'message': 'Omniful Partner Portal API is running'}), 200
    
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Omniful Partner Portal API',
            'version': '1.1.0',
            'status': 'running'
        }), 200
    
    return app

# Create the app instance
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

