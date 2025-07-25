from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from apispec_webframeworks.flask import FlaskPlugin
from flask import Flask
from flask_cors import CORS
from mysql.connector import pooling
from dotenv import load_dotenv
import os

from global_routes import GlobalRoutes
from utils.custom_logger import CustomLogger
from flask_swagger_ui import get_swaggerui_blueprint

from app.modules.sample_blueprint_package.routes import SampleBlueprint
from app.modules.dashboard_service.routes import DashboardServiceRoutes
from app.modules.drives_service.routes import DrivesServiceRoutes
from app.modules.profile_service.routes import ProfileServiceRoutes
from app.modules.add_student_service.routes import AddStudentServiceRoutes
from app.modules.delete_student_service.routes import RemoveStudentServiceRoutes
from app.modules.notices_service.routes import NoticesServiceRoutes
from app.modules.username_service.routes import UsernamesServiceRoutes

# Instantiate the CustomLogger
logger_instance = CustomLogger('app')
logger = logger_instance.get_logger()

# MySQL Connection Pool
class MySQLConnector:
    def __init__(self):
        load_dotenv()
        db_config = {
            "host": os.getenv("DB_HOST"),
            "user": os.getenv("DB_USER"),
            "password": os.getenv("DB_PASSWORD"),
            "database": os.getenv("DB_NAME"),
        }
        self.pool = pooling.MySQLConnectionPool(
            pool_name="mypool",
            pool_size=32,  # Adjust based on expected load (e.g., 5-10)(min=0,max=32)
            pool_reset_session=True,
            **db_config
        )

    def connect(self):
        try:
            return self.pool.get_connection()
        except Exception as err:
            logger.error(f"Database connection error: {err}")
            return None

    def close(self, connection):
        if connection and connection.is_connected():
            logger.info("connection closed")
            connection.close()

def initialize_apispec():
    logger.info("Initialize APISpec")
    apispec_config = {
        'title': 'Placement Portal API',
        'version': '1.0.0',
        'openapi_version': '3.0.0',
    }
    return APISpec(
        title=apispec_config['title'],
        version=apispec_config['version'],
        openapi_version=apispec_config['openapi_version'],
        plugins=[FlaskPlugin(), MarshmallowPlugin()],
    )

def create_app():
    logger.info("Initialize Flask")
    app = Flask(__name__)
    CORS(app)

    # Initialize database connection pool and attach to app
    app.db_pool = MySQLConnector()

    # Initialize API specification
    spec = initialize_apispec()

    # Register blueprints
    register_blueprints(app, spec)

    return app

def register_blueprints(app, spec):
    logger.info("Register Blueprint - Sample Blueprint Registration")
    app.register_blueprint(SampleBlueprint(logger).blueprint, url_prefix="/v1")

    logger.info("Register Blueprint - Global Routes")
    app.register_blueprint(GlobalRoutes(logger, app, spec=spec).blueprint, url_prefix="/v1")

    logger.info("Register Blueprint - Dashboard Service Routes")
    app.register_blueprint(DashboardServiceRoutes(logger, app, spec=spec).blueprint, url_prefix="/v1")

    logger.info("Register Blueprint - Drives Service Routes")
    app.register_blueprint(DrivesServiceRoutes(logger, app, spec=spec).blueprint, url_prefix="/v1")

    logger.info("Register Blueprint - Profile Service Routes")
    app.register_blueprint(ProfileServiceRoutes(logger, app, spec=spec).blueprint, url_prefix="/v1")

    logger.info("Register Blueprint - Add Student Service Routes")
    app.register_blueprint(AddStudentServiceRoutes(logger, app, spec=spec).blueprint, url_prefix="/v1")

    logger.info("Register Blueprint - Delete Student Service Routes")
    app.register_blueprint(RemoveStudentServiceRoutes(logger, app, spec=spec).blueprint, url_prefix="/v1")

    logger.info("Register Blueprint - Notices Service Routes")
    app.register_blueprint(NoticesServiceRoutes(logger, app, spec=spec).blueprint, url_prefix="/v1")

    logger.info("Register Blueprint - Login Service Routes")
    app.register_blueprint(UsernamesServiceRoutes(logger, app, spec=spec).blueprint, url_prefix="/v1")

    # Register Swagger UI
    logger.info("Register Blueprint - Swagger UI")
    swaggerui_blueprint = get_swaggerui_blueprint(
        "/api/docs",
        "/v1/api/swagger.json",
        config={"app_name": "Placement Portal Service"},
    )
    app.register_blueprint(swaggerui_blueprint)