from flask import Blueprint, jsonify, request ,current_app
from datetime import datetime, timedelta
import re
from connectors.mysql_connector import MySQLConnector

class DrivesServiceRoutes:
    def __init__(self, logger, app, spec):
        self.logger = logger
        self.app = app
        self.spec = spec
        self.db_connector = MySQLConnector()  # Create an instance of the MySQLConnector
        self.blueprint = Blueprint("drives_service_routes", __name__)

        self.blueprint.add_url_rule(
            "/preplacement-activity-drives",
            view_func=self.fetch_preplacement_activity_drives,
            methods=["GET"],
        )

        self.blueprint.add_url_rule(
            "/placement-drives",
            view_func=self.fetch_placement_drives,
            methods=["GET"],
        )

        # Add POST routes for adding new drives
        self.blueprint.add_url_rule(
            "/preplacement-activity-drives",
            view_func=self.add_preplacement_activity_drive,
            methods=["POST"],
        )

        self.blueprint.add_url_rule(
            "/placement-drives",
            view_func=self.add_placement_drive,
            methods=["POST"],
        )

        # Add DELETE routes for deleting drives
        self.blueprint.add_url_rule(
            "/preplacement-activity-drives/<int:drive_id>",
            view_func=self.delete_preplacement_activity_drive,
            methods=["DELETE"],
        )

        self.blueprint.add_url_rule(
            "/placement-drives/<int:drive_id>",
            view_func=self.delete_placement_drive,
            methods=["DELETE"],
        )

        # Add POST route for student registration to a placement drive
        self.blueprint.add_url_rule(
            "/placement-drives/registration",
            view_func=self.register_student_for_placement_drive,
            methods=["POST"],
        )

        # Add POST route for student registration to a pre placement activity
        self.blueprint.add_url_rule(
            "/preplacement-activity-drives/registration",
            view_func=self.register_student_for_pre_placement_activity,
            methods=["POST"],
        )
        # Add POST route for student registration to a placement drive
        self.blueprint.add_url_rule(
            "/placement-drives/unregistration",
            view_func=self.unregister_student_for_placement_drive,
            methods=["POST"],
        )

        # Add POST route for student registration to a pre placement activity
        self.blueprint.add_url_rule(
            "/preplacement-activity-drives/unregistration",
            view_func=self.unregister_student_for_pre_placement_activity,
            methods=["POST"],
        )
        
                
        self.blueprint.add_url_rule(
            "/placement-drives/<int:drive_id>",
            view_func=self.update_placement_drive,
            methods=["PUT"],
        )
        
          # Add PUT route for updating a drive
        self.blueprint.add_url_rule(
            "/preplacement-activity-drives/<int:activity_id>",
            view_func=self.update_preplacement_activity_drive,
            methods=["PUT"],
        )

    def fetch_preplacement_activity_drives(self):
        """
        ---
        get:
            summary: Fetch all Pre Placement drives
            description: |
                This endpoint retrieves all pre-placement drives available in the system. You can filter by
                `company` (company name), `activity_name` (activity name) and `date` (start date of the drive in 'DDth Month YYYY' format).
            parameters:
                - name: company
                  in: query
                  description: The company hosting the drive.
                  required: false
                  schema:
                    type: string
                - name: date
                  in: query
                  description: The start date of the pre-placement drive in 'DDth Month YYYY' format.
                  required: false
                  schema:
                    type: string
                - name: activity_name
                  in: query
                  description: The activity name of the pre-placement drive.
                  required: false
                  schema:
                    type: string
            responses:
                200:
                    description: A list of pre-placement drives.
                    content:
                        application/json:
                            schema:
                                type: array
                                items:
                                    type: object
                                    properties:
                                        id:
                                            type: integer
                                            description: The unique identifier of the placement drive.
                                        company:
                                            type: string
                                            description: The name of the company hosting the drive.
                                        activity:
                                            type: string
                                            description: The activity name of the pre-placement drive.
                                        details:
                                            type: string
                                            description: The details of the pre-placement drive.
                                        date:
                                            type: string
                                            description: The start date of the placement drive in the format "ddth Month yyyy".
                                        link:
                                            type: string
                                            description: Registration link for the placement drive.
                500:
                    description: Unable to fetch the placement drives.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """
         # Extract data from the request
        connection = current_app.db_pool.connect()
        if connection is None:
            return jsonify({"error": "Unable to connect to the database"}), 500

        cursor = connection.cursor(dictionary=True)

        # Base query for fetching placement drives
        query = "SELECT * FROM preplacementactivities WHERE 1=1"
        params = []

        # Check if `company` is provided
        company_filter = request.args.get('company')
        if company_filter:
            query += " AND company LIKE %s"
            params.append(f"%{company_filter}%")

        date_filter = request.args.get('date')
        if date_filter:
            try:
                clean_date = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_filter)
                formatted_date = datetime.strptime(clean_date, "%d %B %Y").strftime("%Y-%m-%d")
                query += " AND DATE(start_date) = %s"
                params.append(formatted_date)
            except ValueError:
                return jsonify({"error": "Invalid date format. Use 'DDth Month YYYY'."}), 400

        # Execute main query
        cursor.execute(query, params)
        try:
            drives_data = cursor.fetchall()
        except Exception as e:
            current_app.logger.error(f"MySQL OperationalError: {e}")
            return jsonify({"error": "Database connection lost during query."}), 500

        drives = []

        for row in drives_data:
            drive_id = row["id"]

            # Fetch registered students from preplacementactivityregistrations
            cursor.execute("""
                SELECT s.id, s.full_name, s.roll_no, s.email
                FROM preplacementactivityregistrations ppr
                JOIN students s ON ppr.student_id = s.id
                WHERE ppr.preplacement_activity_id = %s
            """, (drive_id,))
            registered_students = cursor.fetchall()

            drive = {
                "status": row["status"],
                "id": row["id"],
                "company": row["company"],
                "activity": row["activity_name"],
                "date": row["date"].strftime("%dth %B %Y"),
                "description": row["description"],
                "applications": len(registered_students),
                "registeredStudents": registered_students,
                "link": row["link"],
            }

            drives.append(drive)

        cursor.close()
        current_app.db_pool.close(connection)

        return jsonify(drives)

        drives = []
        for row in result:
            drive = {
                "id": row["id"],
                "company": row["company"],
                "activity": row["activity_name"],
                "details": [row["description"]],
                "date": row["date"],  # Formatting the date as required
                "status": row["status"],  # Assuming all drives are ongoing for now
                "link":row["link"]
            }
            drives.append(drive)

        cursor.close()  # Close the cursor
        current_app.db_pool.close(connection)  # Close the database connection using MySQLConnector's close method

        return jsonify(drives)


    def fetch_placement_drives(self):
        """
        ---
        get:
            summary: Fetch all placement drives
            description: |
                This endpoint retrieves all placement drives available in the system. You can filter by
                `company` (company name) and `date` (start date of the drive in 'DDth Month YYYY' format).
            parameters:
                - name: company
                  in: query
                  description: The company hosting the drive.
                  required: false
                  schema:
                    type: string
                - name: date
                  in: query
                  description: The start date of the placement drive in 'DDth Month YYYY' format.
                  required: false
                  schema:
                    type: string
            responses:
                200:
                    description: A list of placement drives.
                    content:
                        application/json:
                            schema:
                                type: array
                                items:
                                    type: object
                                    properties:
                                        id:
                                            type: integer
                                            description: The unique identifier of the placement drive.
                                        company:
                                            type: string
                                            description: The name of the company hosting the drive.
                                        roles:
                                            type: array
                                            items:
                                                type: string
                                            description: List of roles available in the placement drive.
                                        date:
                                            type: string
                                            description: The start date of the placement drive in the format "ddth Month yyyy".
                                        link:
                                            type: string
                                            description: Registration link for the placement drive.
                500:
                    description: Unable to fetch the placement drives.
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

        cursor = connection.cursor(dictionary=True)

        # Base query to get drives
        query = "SELECT * FROM placementdrives WHERE 1=1"
        params = []

        # Optional filters
        company_filter = request.args.get('company')
        if company_filter:
            query += " AND company_name LIKE %s"
            params.append(f"%{company_filter}%")

        date_filter = request.args.get('date')
        if date_filter:
            try:
                clean_date = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_filter)
                formatted_date = datetime.strptime(clean_date, "%d %B %Y").strftime("%Y-%m-%d")
                query += " AND DATE(start_date) = %s"
                params.append(formatted_date)
            except ValueError:
                return jsonify({"error": "Invalid date format. Use 'DDth Month YYYY'."}), 400

        # Execute main drive query
        cursor.execute(query, params)
        try:
            drives_data = cursor.fetchall()
        except Exception as e:
            current_app.logger.error(f"MySQL OperationalError: {e}")
            return jsonify({"error": "Database connection lost during query."}), 500

        drives = []

        for row in drives_data:
            drive_id = row["id"]

            # Sub-query to get registered students for this drive
            cursor.execute("""
                SELECT s.id, s.full_name, s.roll_no, s.email
                FROM studentregistrations sr
                JOIN students s ON sr.student_id = s.id
                WHERE sr.drive_id = %s
            """, (drive_id,))
            registered_students = cursor.fetchall()
            # Build the drive object
            drive = {
                "id": row["id"],
                "company": row["company_name"],
                "date": row["start_date"].strftime("%dth %B %Y"),
                "status": row["status"],
                # "description": row["details"],  # Assuming `details` is job description
                "applications": len(registered_students),
                "registeredStudents": registered_students,
                "link": row["registration_link"],
                "roles": [row["details"]]  # or split by ',' if you store multiple roles in 'details'
            }

            drives.append(drive)

        cursor.close()
        current_app.db_pool.close(connection)

        return jsonify(drives)

    def add_preplacement_activity_drive(self):
        """
        ---
        post:
            summary: Add a new Pre Placement Drive
            description: |
                This endpoint allows adding a new pre-placement drive.
            requestBody:
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                company:
                                    type: string
                                    description: The company hosting the drive.
                                activity_name:
                                    type: string
                                    description: The activity name of the pre-placement drive.
                                details:
                                    type: string
                                    description: Details about the pre-placement drive.
                                date:
                                    type: string
                                    description: The start date of the drive in 'DDth Month YYYY' format.
            responses:
                201:
                    description: The pre-placement drive was successfully created.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    message:
                                        type: string
                                        description: Success message.
                400:
                    description: Invalid input data.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """
        try:
            # Get data from the request body
            data = request.get_json()

            # Validate the incoming data
            required_fields = ["company", "activity_name", "details", "date"]
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"{field} is required"}), 400

            company = data["company"]
            activity_name = data["activity_name"]
            details = data["details"]
            date_str = data["date"]

            # Convert the date to proper format
            try:
                clean_date = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str)
                formatted_date = datetime.strptime(clean_date, "%d %B %Y").strftime("%Y-%m-%d")
            except ValueError:
                return jsonify({"error": "Invalid date format. Please use 'DDth Month YYYY' format."}), 400

            # Insert the new drive into the database
            connection = current_app.db_pool.connect()
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            cursor = connection.cursor()

            query = """
                INSERT INTO preplacementactivities (company, activity_name, description, date)
                VALUES (%s, %s, %s, %s)
            """
            params = (company, activity_name, details, formatted_date)

            cursor.execute(query, params)
            connection.commit()  # Commit the transaction

            cursor.close()
            current_app.db_pool.close(connection)

            return jsonify({"message": "Pre-placement drive created successfully."}), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def add_placement_drive(self):
        """
        ---
        post:
            summary: Add a new Placement Drive
            description: |
                This endpoint allows adding a new placement drive.
            requestBody:
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                company:
                                    type: string
                                    description: The company hosting the drive.
                                status:
                                    type: string
                                    description: The status of the drive (Planned, Active, Completed, Closed).
                                roles:
                                    type: array
                                    items:
                                        type: string
                                    description: The roles available in the placement drive.
                                date:
                                    type: string
                                    description: The start date of the drive in 'YYYY-MM-DD' format.
                                end_date:
                                    type: string
                                    description: The end date of the drive in 'YYYY-MM-DD' format.
                                registration_link:
                                    type: string
                                    description: The registration link for the drive.
                                notice_pdf_link:
                                    type: string
                                    description: The notice PDF link for the drive (optional).
            responses:
                201:
                    description: The placement drive was successfully created.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    message:
                                        type: string
                                        description: Success message.
                400:
                    description: Invalid input data.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """
        try:
            # Get data from the request body
            data = request.get_json()
            print(data)
            # Validate the incoming data
            required_fields = ["company", "roles", "date", "registration_link", "status"]
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"{field} is required"}), 400

            company = data["company"]
            roles = data["roles"]
            date_str = data["date"]
            registration_link = data["registration_link"]
            status = data["status"]
            notice_pdf_link = data.get("notice_pdf_link", None)  # Optional field
            end_date_str = data.get("end_date", None)  # Optional field

            # Validate the 'status' field to ensure it contains one of the allowed values
            # allowed_statuses = ['Planned', 'Active', 'Completed', 'Closed']
            # if status not in allowed_statuses:
                # return jsonify({"error": f"Invalid status. Allowed values are: {', '.join(allowed_statuses)}"}), 400

            # Validate and format the 'date' (start_date) field (YYYY-MM-DD format)
            try:
                formatted_start_date = datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y-%m-%d")
            except ValueError:
                return jsonify({"error": "Invalid date format. Please use 'YYYY-MM-DD' format."}), 400

            # If no end_date is provided, set it as one day after the start_date
            if not end_date_str:
                end_date = datetime.strptime(formatted_start_date, "%Y-%m-%d") + timedelta(days=1)
                formatted_end_date = end_date.strftime("%Y-%m-%d")
            else:
                # Validate and format the 'end_date' field (YYYY-MM-DD format)
                try:
                    formatted_end_date = datetime.strptime(end_date_str, "%Y-%m-%d").strftime("%Y-%m-%d")
                except ValueError:
                    return jsonify({"error": "Invalid end_date format. Please use 'YYYY-MM-DD' format."}), 400

            # Insert the new drive into the database
            connection = current_app.db_pool.connect()
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            cursor = connection.cursor()

            query = """
                INSERT INTO placementdrives (company_name, details, start_date, end_date, registration_link, status, notice_pdf_link)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            # Include notice_pdf_link as part of the parameters (it will be None if not provided)
            params = (company, ', '.join(roles), formatted_start_date, formatted_end_date, registration_link, status, notice_pdf_link)

            cursor.execute(query, params)
            connection.commit()  # Commit the transaction

            cursor.close()
            current_app.db_pool.close(connection)

            return jsonify({"message": "Placement drive created successfully."}), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def delete_preplacement_activity_drive(self, drive_id):
        """
        ---
        delete:
            summary: Delete a Pre Placement Drive
            description: |
                This endpoint allows the deletion of a pre-placement drive by its ID.
            parameters:
                - name: id
                  in: path
                  description: The ID of the pre-placement drive to delete.
                  required: true
                  schema:
                    type: integer
            responses:
                200:
                    description: The pre-placement drive was successfully deleted.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    message:
                                        type: string
                                        description: Success message.
                400:
                    description: Invalid ID provided.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                500:
                    description: Unable to delete the pre-placement drive.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """
        try:
            # Connect to the database
            connection = current_app.db_pool.connect()
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            cursor = connection.cursor()

            # Delete query
            query = "DELETE FROM preplacementactivities WHERE id = %s"
            params = (drive_id,)

            # Execute the query
            cursor.execute(query, params)
            connection.commit()

            # Check if any rows were affected (i.e., deleted)
            if cursor.rowcount == 0:
                return jsonify({"error": "No drive found with the provided ID"}), 400

            cursor.close()
            current_app.db_pool.close(connection)

            return jsonify({"message": "Pre-placement drive deleted successfully."}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def delete_placement_drive(self, drive_id):
        """
        ---
        delete:
            summary: Delete a Placement Drive
            description: |
                This endpoint allows the deletion of a placement drive by its ID.
            parameters:
                - name: id
                  in: path
                  description: The ID of the placement drive to delete.
                  required: true
                  schema:
                    type: integer
            responses:
                200:
                    description: The placement drive was successfully deleted.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    message:
                                        type: string
                                        description: Success message.
                400:
                    description: Invalid ID provided.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                500:
                    description: Unable to delete the placement drive.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """
        try:
            # Connect to the database
            connection = current_app.db_pool.connect()
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            cursor = connection.cursor()

            # Delete query
            query = "DELETE FROM placementdrives WHERE id = %s"
            params = (drive_id,)

            # Execute the query
            cursor.execute(query, params)
            connection.commit()

            # Check if any rows were affected (i.e., deleted)
            if cursor.rowcount == 0:
                return jsonify({"error": "No drive found with the provided ID"}), 400

            cursor.close()
            current_app.db_pool.close(connection)

            return jsonify({"message": "Placement drive deleted successfully."}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def register_student_for_placement_drive(self):
        """
        ---
        post:
            summary: Register a Student for a Placement Drive
            description: |
                This endpoint allows a student to register for a placement drive by providing the `student_id` and `drive_id`.
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                student_id:
                                    type: integer
                                    description: The ID of the student registering for the placement drive.
                                    example: 1
                                drive_id:
                                    type: integer
                                    description: The ID of the placement drive the student wants to register for.
                                    example: 1
            responses:
                201:
                    description: The student was successfully registered for the placement drive.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    message:
                                        type: string
                                        description: Success message.
                                        example: "Student successfully registered for the placement drive"
                400:
                    description: Missing required parameters (student_id or drive_id).
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                                        example: "Both 'student_id' and 'drive_id' are required"
                500:
                    description: An error occurred while registering the student.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                                        example: "An error occurred while registering the student"

        """
        try:
            # Extract data from the request
            data = request.get_json()

            # Validate the input
            if "student_id" not in data or "drive_id" not in data:
                return jsonify({"error": "Both 'student_id' and 'drive_id' are required"}), 400

            student_id = data["student_id"]
            drive_id = data["drive_id"]
            registration_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Connect to the database
            connection = current_app.db_pool.connect()
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            # Create the SQL query to insert the registration data
            query = """
                INSERT INTO studentregistrations (student_id, drive_id, registration_date)
                VALUES (%s, %s, %s)
            """
            cursor = connection.cursor()
            cursor.execute(query, (student_id, drive_id, registration_date))
            connection.commit()

            # Close the database connection
            cursor.close()
            connection.close()

            # Return a success message
            return jsonify({"message": "Student successfully registered for the placement drive"}), 201

        except Exception as e:
            self.logger.error(f"Error registering student: {e}")
            return jsonify({"error": "An error occurred while registering the student"}), 500
        
    def unregister_student_for_placement_drive(self):
        """
        ---
        post:
            summary: Register a Student for a Placement Drive
            description: |
                This endpoint allows a student to register for a placement drive by providing the `student_id` and `drive_id`.
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                student_id:
                                    type: integer
                                    description: The ID of the student registering for the placement drive.
                                    example: 1
                                drive_id:
                                    type: integer
                                    description: The ID of the placement drive the student wants to register for.
                                    example: 1
            responses:
                201:
                    description: The student was successfully registered for the placement drive.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    message:
                                        type: string
                                        description: Success message.
                                        example: "Student successfully registered for the placement drive"
                400:
                    description: Missing required parameters (student_id or drive_id).
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                                        example: "Both 'student_id' and 'drive_id' are required"
                500:
                    description: An error occurred while registering the student.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                                        example: "An error occurred while registering the student"

        """
        try:
            # Extract data from the request
            data = request.get_json()

            # Validate the input
            if "student_id" not in data or "drive_id" not in data:
                return jsonify({"error": "Both 'student_id' and 'drive_id' are required"}), 400

            student_id = data["student_id"]
            drive_id = data["drive_id"]

            # Connect to the database
            connection = current_app.db_pool.connect()
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            # Create the SQL query to delete the registration
            query = """
                DELETE FROM studentregistrations
                WHERE student_id = %s AND drive_id = %s
            """
            cursor = connection.cursor()
            cursor.execute(query, (student_id, drive_id))
            connection.commit()

            # Check if a row was actually deleted
            if cursor.rowcount == 0:
                return jsonify({"message": "No registration found for the given student and drive"}), 404

            # Close the database connection
            cursor.close()
            connection.close()

            # Return a success message
            return jsonify({"message": "Student successfully unregistered from the placement drive"}), 200

        except Exception as e:
            self.logger.error(f"Error unregistering student from placement drive: {e}")
            return jsonify({"error": "An error occurred while unregistering the student"}), 500


    def update_preplacement_activity_drive(self, activity_id):
        """
        ---
        put:
            summary: Update an existing Pre Placement Drive
            description: Update the details of a pre-placement drive by its ID.
            parameters:
            - name: activity_id
                in: path
                required: true
                schema:
                type: integer
            requestBody:
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                company:
                                    type: string
                                activity_name:
                                    type: string
                                details:
                                    type: string
                                date:
                                    type: string
                                    description: Date in 'DDth Month YYYY' format.
                                status:
                                    type: string
                                link:
                                    type: string
                                participants:
                                    type: integer
            responses:
                200:
                    description: Update successful
                400:
                    description: Bad request
                404:
                    description: Activity not found
                500:
                    description: Internal server error
        """
        try:
            data = request.get_json()

            required_fields = ["company", "activity_name", "details", "date", "status", "link", "participants"]
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"{field} is required"}), 400

            company = data["company"]
            activity_name = data["activity_name"]
            details = data["details"]
            date_str = data["date"]
            status = data["status"]
            link = data["link"]
            participants = data["participants"]

            # Convert date to proper format
            try:
                clean_date = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str)
                formatted_date = datetime.strptime(clean_date, "%d %B %Y").strftime("%Y-%m-%d")
            except ValueError:
                return jsonify({"error": "Invalid date format. Please use 'DDth Month YYYY' format."}), 400

            connection = current_app.db_pool.connect()
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            cursor = connection.cursor()

            # Check if the activity exists
            cursor.execute("SELECT id FROM preplacementactivities WHERE id = %s", (activity_id,))
            if cursor.fetchone() is None:
                cursor.close()
                current_app.db_pool.close(connection)
                return jsonify({"error": "Pre-placement drive not found"}), 404

            # Update the activity
            update_query = """
                UPDATE preplacementactivities
                SET company = %s,
                    activity_name = %s,
                    description = %s,
                    date = %s,
                    status = %s,
                    link = %s,
                    participants = %s
                WHERE id = %s
            """
            params = (company, activity_name, details, formatted_date, status, link, participants, activity_id)

            cursor.execute(update_query, params)
            connection.commit()

            cursor.close()
            current_app.db_pool.close(connection)

            return jsonify({"message": "Pre-placement drive updated successfully."}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def update_placement_drive(self, drive_id):
        """
        ---
        put:
            summary: Update an existing Placement Drive
            description: Update details of a placement drive using its ID.
            parameters:
                - in: path
                name: drive_id
                required: true
                schema:
                    type: integer
                description: ID of the placement drive to update
            requestBody:
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                company:
                                    type: string
                                status:
                                    type: string
                                    enum: [Planned, Active, Completed, Closed]
                                roles:
                                    type: array
                                    items:
                                        type: string
                                date:
                                    type: string
                                    description: Start date in 'YYYY-MM-DD'
                                end_date:
                                    type: string
                                registration_link:
                                    type: string
                                notice_pdf_link:
                                    type: string
            responses:
                200:
                    description: Drive updated successfully.
                400:
                    description: Invalid input.
                404:
                    description: Drive not found.
        """
        try:
            data = request.get_json()

            required_fields = ["company", "roles", "date", "registration_link", "status"]
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"{field} is required"}), 400

            company = data["company"]
            roles = data["roles"]
            date_str = data["date"]
            registration_link = data["registration_link"]
            status = data["status"]
            try:
                clean_date = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str)
                formatted_date = datetime.strptime(clean_date, "%d %B %Y").strftime("%Y-%m-%d")
            except ValueError:
                return jsonify({"error": "Invalid date format. Please use 'DDth Month YYYY' format."}), 400



            connection = current_app.db_pool.connect()
            if connection is None:
                print("connection is null")
                return jsonify({"error": "Unable to connect to database"}), 500

            cursor = connection.cursor()

            update_query = """
                UPDATE placementdrives
                SET company_name = %s,
                    details = %s,
                    start_date = %s,
                    registration_link = %s,
                    status = %s
                WHERE id = %s
            """
            params = (
                company,
                ', '.join(roles),
                formatted_date,
                registration_link,
                status,
                drive_id,
            )
            

            cursor.execute(update_query, params)
            if cursor.rowcount == 0:
                cursor.close()
                current_app.db_pool.close(connection)
                return jsonify({"error": "Placement drive not found."}), 404

            connection.commit()
            cursor.close()
            current_app.db_pool.close(connection)

            return jsonify({"message": "Placement drive updated successfully."}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def register_student_for_pre_placement_activity(self):
        """
        ---
        post:
            summary: Register a Student for a Pre-Placement Activity
            description: |
                This endpoint allows a student to register for a pre placement activity by providing the `student_id` and `preplacement_activity_id`.
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                student_id:
                                    type: integer
                                    description: The ID of the student registering for the placement drive.
                                    example: 1
                                preplacement_activity_id:
                                    type: integer
                                    description: The ID of the pre placement activity the student wants to register for.
                                    example: 1
            responses:
                201:
                    description: The student was successfully registered for the placement drive.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    message:
                                        type: string
                                        description: Success message.
                                        example: "Student successfully registered for the placement drive"
                400:
                    description: Missing required parameters (student_id or preplacement_activity_id).
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                                        example: "Both 'student_id' and 'preplacement_activity_id' are required"
                500:
                    description: An error occurred while registering the student.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                                        example: "An error occurred while registering the student"

        """
        try:
            # Extract data from the request
            data = request.get_json()

            # Validate the input
            if "student_id" not in data or "preplacement_activity_id" not in data:
                return jsonify({"error": "Both 'student_id' and 'preplacement_activity_id' are required"}), 400

            student_id = data["student_id"]
            preplacement_activity_id = data["preplacement_activity_id"]
            registration_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Connect to the database
            connection = current_app.db_pool.connect()
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            # Create the SQL query to insert the registration data
            query = """
                INSERT INTO preplacementactivityregistrations (student_id, preplacement_activity_id, created_at)
                VALUES (%s, %s, %s)
            """
            cursor = connection.cursor()
            cursor.execute(query, (student_id, preplacement_activity_id, registration_date))
            connection.commit()

            # Close the database connection
            cursor.close()
            connection.close()

            # Return a success message
            return jsonify({"message": "Student successfully registered for the placement drive"}), 201

        except Exception as e:
            self.logger.error(f"Error registering student: {e}")
            return jsonify({"error": "An error occurred while registering the student"}), 500
        
        
    def unregister_student_for_pre_placement_activity(self):
        """
        ---
        post:
            summary: Register a Student for a Pre-Placement Activity
            description: |
                This endpoint allows a student to register for a pre placement activity by providing the `student_id` and `preplacement_activity_id`.
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                student_id:
                                    type: integer
                                    description: The ID of the student registering for the placement drive.
                                    example: 1
                                preplacement_activity_id:
                                    type: integer
                                    description: The ID of the pre placement activity the student wants to register for.
                                    example: 1
            responses:
                201:
                    description: The student was successfully registered for the placement drive.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    message:
                                        type: string
                                        description: Success message.
                                        example: "Student successfully registered for the placement drive"
                400:
                    description: Missing required parameters (student_id or preplacement_activity_id).
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                                        example: "Both 'student_id' and 'preplacement_activity_id' are required"
                500:
                    description: An error occurred while registering the student.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
                                        example: "An error occurred while registering the student"

        """
        try:
            # Extract data from the request
            data = request.get_json()

            # Validate the input
            if "student_id" not in data or "preplacement_activity_id" not in data:
                return jsonify({"error": "Both 'student_id' and 'preplacement_activity_id' are required"}), 400

            student_id = data["student_id"]
            preplacement_activity_id = data["preplacement_activity_id"]

            # Connect to the database
            connection = current_app.db_pool.connect()
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            # Create the SQL query to delete the registration
            query = """
                DELETE FROM preplacementactivityregistrations
                WHERE student_id = %s AND preplacement_activity_id = %s
            """
            cursor = connection.cursor()
            cursor.execute(query, (student_id, preplacement_activity_id))
            connection.commit()

            # Check if a row was actually deleted
            if cursor.rowcount == 0:
                return jsonify({"message": "No registration found for the given student and activity"}), 404

            # Close the database connection
            cursor.close()
            connection.close()

            # Return a success message
            return jsonify({"message": "Student successfully unregistered from the placement drive"}), 200

        except Exception as e:
            self.logger.error(f"Error unregistering student: {e}")
            return jsonify({"error": "An error occurred while unregistering the student"}), 500
