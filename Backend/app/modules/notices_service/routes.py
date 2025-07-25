from flask import Blueprint, jsonify, request, current_app
from connectors.mysql_connector import MySQLConnector

class NoticesServiceRoutes:
    def __init__(self, logger, app, spec):
        self.logger = logger
        self.app = app
        self.spec = spec
        self.db_connector = MySQLConnector()  # Create an instance of the MySQLConnector
        self.blueprint = Blueprint("notices_service_routes", __name__)

        # Add POST route for adding a new notice
        self.blueprint.add_url_rule(
            "/notices",
            view_func=self.add_notice,
            methods=["POST"],
        )

        # Add PUT route for updating an existing notice
        self.blueprint.add_url_rule(
            "/notices/<int:notice_id>",
            view_func=self.update_notice,
            methods=["PUT"],
        )

        # Add DELETE route for deleting a notice
        self.blueprint.add_url_rule(
            "/notices/<int:notice_id>",
            view_func=self.delete_notice,
            methods=["DELETE"],
        )

    def add_notice(self):
        """
        ---
        post:
            summary: Add a new notice
            description: |
                This endpoint allows adding a new notice to the database. The request body should contain the fields: `title`, `content`, `is_read`, and optionally `drive_id`.
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                title:
                                    type: string
                                    description: The title of the notice.
                                content:
                                    type: string
                                    description: The content of the notice.
                                drive_id:
                                    type: integer
                                    description: The associated drive ID (optional, can be NULL).
                                is_read:
                                    type: integer
                                    description: A flag indicating whether the notice has been read (0 for unread, 1 for read). Defaults to 0.
                                    default: 0
            responses:
                201:
                    description: The notice has been added successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    message:
                                        type: string
                                        description: The status message of the request.
                                    id:
                                        type: integer
                                        description: The ID of the newly created notice.
                400:
                    description: Missing required fields (title and content).
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                500:
                    description: Database error or failure to insert notice.
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

        if not data:
            return jsonify({"error": "Invalid JSON payload or content-type."}), 400

        required_fields = ["title", "content"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field.capitalize()} is required."}), 400

        # Extract values from the payload
        title = data.get("title")
        content = data.get("content")
        drive_id = data.get("drive_id", None)  # Optional
        is_read = data.get("is_read", 0)  # Defaults to unread

        # Validate required fields
        if not title or not content:
            return jsonify({"error": "Title and content are required fields."}), 400

        # Simplified database interaction
        connection = current_app.db_pool.connect()
        if connection is None:
            return jsonify({"error": "Unable to connect to the database"}), 500

        cursor = connection.cursor()

        # SQL query to insert the notice into the database
        query = """
        INSERT INTO generalnotices (title, content, is_read, drive_id, created_at)
        VALUES (%s, %s, %s, %s, NOW())
        """
        params = (title, content, is_read, drive_id)

        try:
            cursor.execute(query, params)
            connection.commit()
            notice_id = cursor.lastrowid
        except Exception as e:
            self.logger.error(f"MySQL OperationalError: {e}")
            return jsonify({"error": "Failed to insert notice."}), 500

        cursor.close()
        current_app.db_pool.close(connection)

        return jsonify({"message": "Notice added successfully.", "id": notice_id}), 201

    def update_notice(self, notice_id):
        """
        ---
        put:
            summary: Update an existing notice
            description: |
                This endpoint allows updating an existing notice in the database. The request body should contain the fields: `title`, `content`, `is_read`, and optionally `drive_id`.
            parameters:
                - in: path
                  name: notice_id
                  description: The ID of the notice to be updated.
                  required: true
                  schema:
                    type: integer
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                title:
                                    type: string
                                    description: The title of the notice.
                                content:
                                    type: string
                                    description: The content of the notice.
                                drive_id:
                                    type: integer
                                    description: The associated drive ID (optional, can be NULL).
                                is_read:
                                    type: integer
                                    description: A flag indicating whether the notice has been read (0 for unread, 1 for read).
            responses:
                200:
                    description: The notice has been updated successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    message:
                                        type: string
                                        description: The status message of the request.
                400:
                    description: Missing required fields (title and content).
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                404:
                    description: Notice not found.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                500:
                    description: Database error or failure to update notice.
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

        title = data.get("title")
        content = data.get("content")
        is_read = data.get("is_read")
        drive_id = data.get("drive_id", None)  # Can be NULL

        if not title or not content:
            return jsonify({"error": "Title and content are required fields."}), 400

        connection = current_app.db_pool.connect()
        if connection is None:
            return jsonify({"error": "Unable to connect to the database"}), 500

        cursor = connection.cursor()

        # Update the notice
        query = """
        UPDATE generalnotices
        SET title = %s, content = %s, is_read = %s, drive_id = %s, created_at = NOW()
        WHERE id = %s
        """
        params = (title, content, is_read, drive_id, notice_id)

        try:
            cursor.execute(query, params)
            connection.commit()
        except Exception as e:
            self.logger.error(f"MySQL OperationalError: {e}")
            return jsonify({"error": "Failed to update notice."}), 500

        cursor.close()
        current_app.db_pool.close(connection)

        return jsonify({"message": "Notice updated successfully."})

    def delete_notice(self, notice_id):
        """
        ---
        delete:
            summary: Delete a notice
            description: |
                This endpoint allows deleting an existing notice from the database based on the notice ID.
            parameters:
                - in: path
                  name: notice_id
                  description: The ID of the notice to be deleted.
                  required: true
                  schema:
                    type: integer
            responses:
                200:
                    description: The notice has been deleted successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    message:
                                        type: string
                                        description: The status message of the request.
                404:
                    description: Notice not found.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                500:
                    description: Database error or failure to delete notice.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """
        connection = current_app.db_pool.connect()
        if connection is None:
            return jsonify({"error": "Unable to connect to the database"}), 500

        cursor = connection.cursor()

        # Delete the notice
        query = "DELETE FROM generalnotices WHERE id = %s"
        params = (notice_id,)

        try:
            cursor.execute(query, params)
            connection.commit()
        except Exception as e:
            self.logger.error(f"MySQL OperationalError: {e}")
            return jsonify({"error": "Failed to delete notice."}), 500

        cursor.close()
        current_app.db_pool.close(connection)

        return jsonify({"message": "Notice deleted successfully."})

