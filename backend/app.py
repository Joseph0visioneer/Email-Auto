"""
Email Automation System - Main Flask Application
컨퍼런스 참석자 이메일 자동화 시스템의 메인 애플리케이션

Architecture: Domain-driven design with service layer pattern
Security: Firebase Authentication + CORS protection
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv('config.env')

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///email_automation.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','))

# 데이터베이스 테이블 생성 (개발용)
with app.app_context():
    db.create_all()

# Import and register blueprints
try:
    from routes.auth import auth_bp
    from routes.attendees import attendees_bp
    from routes.emails import emails_bp
    from routes.templates import templates_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(attendees_bp, url_prefix='/api/attendees')
    app.register_blueprint(emails_bp, url_prefix='/api/emails')
    app.register_blueprint(templates_bp, url_prefix='/api/templates')
except ImportError as e:
    print(f"Warning: Could not import some routes: {e}")
    print("Some features may not be available.")

@app.route('/api/health')
def health_check():
    """시스템 상태 확인 엔드포인트"""
    return jsonify({
        'status': 'healthy',
        'message': 'Email Automation System is running',
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    """404 에러 핸들러"""
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """500 에러 핸들러"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # 개발 환경에서만 실행
    debug_mode = os.getenv('DEBUG', 'False').lower() == 'true'
    app.run(host='127.0.0.1', port=5000, debug=debug_mode)

