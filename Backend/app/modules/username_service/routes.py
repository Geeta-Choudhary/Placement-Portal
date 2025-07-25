from flask import Blueprint, jsonify, request, current_app
from connectors.mysql_connector import MySQLConnector
import uuid
from datetime import datetime
import hashlib


class UsernamesServiceRoutes:
    def __init__(self, logger, app, spec):
        self.logger = logger
        self.app = app
        self.spec = spec
        self.db_connector = MySQLConnector()  # Create an instance of the MySQLConnector
        self.blueprint = Blueprint("usernames_service_routes", __name__)

        self.blueprint.add_url_rule(
            "/coordinators",
            view_func=self.fetch_coordinators,
            methods=["GET"],
        )

        self.blueprint.add_url_rule(
            "/coordinators",
            view_func=self.add_coordinator,
            methods=["POST"],
        )
        self.blueprint.add_url_rule(
            "/auth/login",
            view_func=self.login_user,
            methods=["POST"],
        )

        self.blueprint.add_url_rule(
            "/coordinators/<string:username>",
            view_func=self.delete_coordinator,
            methods=["DELETE"],
        )

    def fetch_coordinators(self):
        """
        ---
        get:
            summary: Fetch all coordinators
            description: |
                This endpoint retrieves all coordinators from the system.
            responses:
                200:
                    description: A list of coordinators.
                    content:
                        application/json:
                            schema:
                                type: array
                                items:
                                    type: object
                                    properties:
                                        id:
                                            type: string
                                            description: The unique identifier of the coordinator.
                                        roll_no:
                                            type: string
                                            description: The roll number of the coordinator.
                                        username:
                                            type: string
                                            description: The username of the coordinator.
                                        created_at:
                                            type: string
                                            description: The timestamp when the coordinator was created.
                500:
                    description: Unable to fetch coordinators.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """
        # Connect to the database
        connection = current_app.db_pool.connect()
        if connection is None:
            return jsonify({"error": "Unable to connect to the database"}), 500

        cursor = connection.cursor(dictionary=True)
        query = "SELECT id, roll_no, username, created_at FROM Usernames WHERE role = 'Coordinator'"

        try:
            cursor.execute(query)
            result = cursor.fetchall()
        except Exception as e:
            self.logger.error(f"MySQL OperationalError: {e}")
            return jsonify({"error": "Database connection lost during query."}), 500

        coordinators = []
        for row in result:
            coordinator = {
                "id": row["id"],
                "roll_no": row["roll_no"],
                "username": row["username"],
                "created_at": row["created_at"]
            }
            coordinators.append(coordinator)

        cursor.close()
        current_app.db_pool.close(connection)

        return jsonify(coordinators)

    def add_coordinator(self):
        """
        ---
        post:
            summary: Add a new coordinator
            description: |
                This endpoint adds a new coordinator to the system by accepting a `username`, `roll_no`, and `password`.
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                roll_no:
                                    type: string
                                    description: The roll number of the student
                                username:
                                    type: string
                                    description: The username of the coordinator
                                password:
                                    type: string
                                    description: The password of the coordinator
            responses:
                201:
                    description: Coordinator added successfully.
                400:
                    description: Bad request (invalid input data).
                500:
                    description: Unable to add the coordinator.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """
        data = request.get_json()

        roll_no = data.get("roll_no")
        username = data.get("username")
        password = data.get("password")

        # Validate input
        if not roll_no or not username or not password:
            return jsonify({"error": "Missing required fields: roll_no, username, or password"}), 400

        # Hash the password
        password_hash = hashlib.sha256(password.encode()).hexdigest()

        # Create a unique ID for the coordinator
        coordinator_id = str(uuid.uuid4())

        # Connect to the database
        connection = current_app.db_pool.connect()
        if connection is None:
            return jsonify({"error": "Unable to connect to the database"}), 500

        cursor = connection.cursor()
        query = """
            INSERT INTO Usernames ( roll_no, username, password_hash, role, created_at)
            VALUES ( %s, %s, %s, 'Coordinator', %s)
        """
        created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        params = ( roll_no, username, password_hash, created_at)

        try:
            cursor.execute(query, params)
            connection.commit()
        except Exception as e:
            self.logger.error(f"MySQL OperationalError: {e}")
            return jsonify({"error": "Failed to add the coordinator"}), 500

        cursor.close()
        current_app.db_pool.close(connection)

        return jsonify({"message": "Coordinator added successfully."}), 201

    def delete_coordinator(self, username):
        """
        ---
        delete:
            summary: Delete a coordinator
            description: |
                This endpoint deletes a coordinator from the system by their `username`.
            parameters:
                - name: username
                  in: path
                  description: The username of the coordinator to delete.
                  required: true
                  schema:
                    type: string
            responses:
                200:
                    description: Coordinator deleted successfully.
                404:
                    description: Coordinator not found.
                500:
                    description: Unable to delete the coordinator.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """
        # Connect to the database
        connection = current_app.db_pool.connect()
        if connection is None:
            return jsonify({"error": "Unable to connect to the database"}), 500

        cursor = connection.cursor()
        query = "DELETE FROM Usernames WHERE username = %s AND role = 'Coordinator'"

        try:
            cursor.execute(query, (username,))
            connection.commit()

            if cursor.rowcount == 0:
                return jsonify({"error": "Coordinator not found"}), 404
        except Exception as e:
            self.logger.error(f"MySQL OperationalError: {e}")
            return jsonify({"error": "Failed to delete the coordinator"}), 500

        cursor.close()
        current_app.db_pool.close(connection)

        return jsonify({"message": "Coordinator deleted successfully."})

    def login_user(self):
        try:
            data = request.get_json()

            if not data:
                return jsonify({"error": "Missing payload"}), 400

            roll_no = data.get("roll_no")
            email = data.get("email")
            password = data.get("password")
            role = data.get("role")

            print(role)
            if not password:    
                return jsonify({"error": "Password is required"}), 400

            # Hash the incoming password
            incoming_password_hash = hashlib.sha256(password.encode()).hexdigest()

            # DB connection
            connection = current_app.db_pool.connect()
            if connection is None:
                return jsonify({"error": "Database connection failed"}), 500

            cursor = connection.cursor(dictionary=True)

            # Determine login type and query
            if role == "Admin" and email:
                query = """
                    SELECT id, username AS email, password_hash, role, 'Admin User' AS name
                    FROM usernames
                    WHERE username = %s AND role = 'Admin'
                """
                cursor.execute(query, (email,))
            elif roll_no:
                query = """
                    SELECT s.id, u.password_hash, u.role, s.roll_no, s.full_name AS name
                    FROM usernames u
                    JOIN Students s ON s.roll_no = u.roll_no
                    WHERE s.roll_no = %s and u.role=%s
                """
                cursor.execute(query, (roll_no,role))
            else:
                return jsonify({"error": "Either 'roll_no' or 'email' is required"}), 400

            user = cursor.fetchone()

            cursor.close()
            connection.close()

            # Validate user existence and password
            if not user or user["password_hash"] != incoming_password_hash:
                return jsonify({}), 200  # Empty object if invalid

            # Build response (no password included)
            if user["role"] == "Admin":
                response = {
                    "id": user["id"],
                    "email": user["email"],
                    "role": user["role"],
                    "name": user["name"]
                }
            else:
                response = {
                    "id": user["id"],
                    "rollNo": user["roll_no"],
                    "role": user["role"],
                    "name": user["name"]
                }

            return jsonify(response), 200

        except Exception as e:
            current_app.logger.error(f"Login error: {e}")
            return jsonify({"error": "Login failed"}), 500
