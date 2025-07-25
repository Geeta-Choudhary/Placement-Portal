from flask import request, jsonify, Blueprint ,current_app
from mysql.connector import connect, Error
from connectors.mysql_connector import MySQLConnector
from datetime import datetime
import hashlib
import uuid

class AddStudentServiceRoutes:
    def __init__(self, logger, app, spec):
        self.logger = logger
        self.app = app
        self.spec = spec
        self.db_connector = MySQLConnector()
        self.blueprint = Blueprint("add_student_service_routes", __name__)

        # Add the AddStudent API route
        self.blueprint.add_url_rule(
            "/student/add",
            view_func=self.add_student,
            methods=["POST"]
        )

    def add_student(self):
        """
            ---
            post:
                summary: Add a new student
                description: |
                    This endpoint adds a new student to the system, along with their profile details, certifications, skills (soft and technical),
                    placement drive registrations, and preplacement activities. The request body should contain all the necessary data for creating
                    a complete student record. If the data is incomplete or invalid, the request will return a `400` error. If there is a database issue,
                    a `500` error will be returned.
                requestBody:
                    required: true
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    full_name:
                                        type: string
                                        description: The full name of the student.
                                    email:
                                        type: string
                                        description: The email address of the student.
                                    phone_number:
                                        type: string
                                        description: The phone number of the student.
                                    roll_no:
                                        type: string
                                        description: The roll number of the student.
                                    batch_year:
                                        type: integer
                                        description: The batch year of the student.
                                    placement_status:
                                        type: string
                                        description: The current placement status of the student.
                                    profile_platform_name:
                                        type: string
                                        description: The platform name (e.g., LinkedIn) where the student's profile is hosted.
                                    profile_link:
                                        type: string
                                        description: A URL to the student's profile on the specified platform.
                                    certifications:
                                        type: array
                                        items:
                                            type: object
                                            properties:
                                                certification_name:
                                                    type: string
                                                    description: The name of the certification.
                                                certificate_link:
                                                    type: string
                                                    description: A link to the certification.
                                                certified_by:
                                                    type: string
                                                    description: The organization that issued the certification.
                                    soft_skills:
                                        type: array
                                        items:
                                            type: object
                                            properties:
                                                skill_name:
                                                    type: string
                                                    description: The name of the soft skill.
                                                proficiency_level:
                                                    type: string
                                                    description: The proficiency level of the soft skill.
                                    technical_skills:
                                        type: array
                                        items:
                                            type: object
                                            properties:
                                                skill_name:
                                                    type: string
                                                    description: The name of the technical skill.
                                                proficiency_level:
                                                    type: string
                                                    description: The proficiency level of the technical skill.
                                    placement_drives:
                                        type: array
                                        items:
                                            type: object
                                            properties:
                                                company_name:
                                                    type: string
                                                    description: The name of the company hosting the placement drive.
                                                registration_link:
                                                    type: string
                                                    description: A registration link for the placement drive.
                                                notice_pdf_link:
                                                    type: string
                                                    description: A link to the notice PDF for the placement drive.
                                                details:
                                                    type: string
                                                    description: Additional details about the placement drive.
                                                start_date:
                                                    type: string
                                                    format: date
                                                    description: The start date of the placement drive.
                                                end_date:
                                                    type: string
                                                    format: date
                                                    description: The end date of the placement drive.
                                    preplacement_activities:
                                        type: array
                                        items:
                                            type: object
                                            properties:
                                                activity_name:
                                                    type: string
                                                    description: The name of the preplacement activity.
                                                company:
                                                    type: string
                                                    description: The company organizing the preplacement activity.
                                                date:
                                                    type: string
                                                    format: date
                                                    description: The date of the preplacement activity.
                                                description:
                                                    type: string
                                                    description: A description of the preplacement activity.
                responses:
                    201:
                        description: The student was successfully added.
                        content:
                            application/json:
                                schema:
                                    type: object
                                    properties:
                                        message:
                                            type: string
                                            description: Success message indicating the student was added.
                                        student_id:
                                            type: integer
                                            description: The unique identifier of the newly added student.
                    400:
                        description: Bad request due to missing or invalid required fields in the request body.
                        content:
                            application/json:
                                schema:
                                    type: object
                                    properties:
                                        error:
                                            type: string
                                            description: Error message indicating the missing or invalid field.
                    500:
                        description: Internal server error due to a database issue.
                        content:
                            application/json:
                                schema:
                                    type: object
                                    properties:
                                        error:
                                            type: string
                                            description: Error message indicating a database connection or query error.
        """

        # data = request.get_json()

        # # Validate incoming data
        # required_fields = [
        #     'full_name', 'email', 'phone_number', 'roll_no', 'batch_year', 'placement_status',
        #     'profile_platform_name', 'profile_link', 'certifications', 'soft_skills',
        #     'technical_skills', 'placement_drives', 'preplacement_activities'
        # ]

        # for field in required_fields:
        #     if field not in data:
        #         return jsonify({"error": f"Missing required field: {field}"}), 400

        # print(data)
        # # Extract student data
        # student_data = {
        #     'full_name': data['full_name'],
        #     'email': data['email'],
        #     'phone_number': data['phone_number'],
        #     'roll_no': data['roll_no'],
        #     'batch_year': data['batch_year'],
        #     'placement_status': data['placement_status'],
        #     'created_at': datetime.now()
        # }

        # try:
        #     # Use the MySQLConnector to establish a connection
        #     connection = current_app.db_pool.connect()        #     if connection is None:
        #         return jsonify({"error": "Unable to connect to the database"}), 500

        #     # Create a cursor to execute queries
        #     cursor = connection.cursor()

        #     # Insert into Students table
        #     cursor.execute("""
        #         INSERT INTO Students (full_name, email, phone_number, roll_no, batch_year, placement_status, created_at)
        #         VALUES (%s, %s, %s, %s, %s, %s, %s)
        #     """, (student_data['full_name'], student_data['email'], student_data['phone_number'], student_data['roll_no'],
        #           student_data['batch_year'], student_data['placement_status'], student_data['created_at']))
        #     student_id = cursor.lastrowid  # Get the inserted student's ID

        #     # Insert into StudentProfiles table
        #     cursor.execute("""
        #         INSERT INTO StudentProfiles (student_id, platform_name, profile_link)
        #         VALUES (%s, %s, %s)
        #     """, (student_id, data['profile_platform_name'], data['profile_link']))

        #     print("status:",student_data['placement_status'])
        #     if student_data['placement_status'].strip().lower() == 'placed':
        #         cursor.execute("""
        #             INSERT INTO PlacedStudents (student_id, package, placement_date,placement_drive_id)
        #             VALUES (%s, %s, %s,%s)
        #         """, (student_id,'60000', '2025-04-04', '6' ))
        #     else:
        #         print("query not executed")
                
                
        #     # Insert into StudentCertifications table
        #     for certification in data['certifications']:
        #         cursor.execute("""
        #             INSERT INTO StudentCertifications (student_id, certification_name, certificate_link, certified_by)
        #             VALUES (%s, %s, %s, %s)
        #         """, (student_id, certification['certification_name'], certification['certificate_link'], certification['certified_by']))

        #     # Insert into SoftSkills table
        #     for skill in data['soft_skills']:
        #         cursor.execute("""
        #             INSERT INTO SoftSkills (student_id, skill_name, proficiency_level)
        #             VALUES (%s, %s, %s)
        #         """, (student_id, skill['skill_name'], skill['proficiency_level']))

        #     # Insert into TechnicalSkills table
        #     for skill in data['technical_skills']:
        #         cursor.execute("""
        #             INSERT INTO TechnicalSkills (student_id, skill_name, proficiency_level)
        #             VALUES (%s, %s, %s)
        #         """, (student_id, skill['skill_name'], skill['proficiency_level']))

        #     # Insert into PlacementDrives (if any) and StudentRegistrations table
        #     for drive in data['placement_drives']:
        #         cursor.execute("""
        #             INSERT INTO PlacementDrives (company_name, registration_link, notice_pdf_link, details, start_date, end_date)
        #             VALUES (%s, %s, %s, %s, %s, %s)
        #         """, (drive['company_name'], drive['registration_link'], drive['notice_pdf_link'], drive['details'],
        #               drive['start_date'], drive['end_date']))
        #         drive_id = cursor.lastrowid  # Get the inserted drive's ID

        #         # Register the student for the drive
        #         cursor.execute("""
        #             INSERT INTO StudentRegistrations (student_id, drive_id)
        #             VALUES (%s, %s)
        #         """, (student_id, drive_id))

        #     # Insert into PreplacementActivities table
        #     for activity in data['preplacement_activities']:
        #         cursor.execute("""
        #             INSERT INTO PreplacementActivities (activity_name, company, date, description)
        #             VALUES (%s, %s, %s, %s)
        #         """, (activity['activity_name'], activity['company'], activity['date'], activity['description']))
        #         activity_id = cursor.lastrowid  # Get the inserted activity's ID

        #         # Register the student for the preplacement activity
        #         cursor.execute("""
        #             INSERT INTO PreplacementActivityRegistrations (student_id, preplacement_activity_id)
        #             VALUES (%s, %s)
        #         """, (student_id, activity_id))
                            
        #     # Commit all changes
        #     connection.commit()

        #     return jsonify({"message": "Student added successfully", "student_id": student_id}), 201

        # except Error as e:
        #     self.logger.error(f"Error while adding student: {e}")
        #     return jsonify({"error": "Database error"}), 500
        
        data = request.get_json()

        # Validate incoming data
        required_fields = [
            'full_name', 'email', 'phone_number', 'roll_no', 'batch_year', 'placement_status',
            'profile_platform_name', 'profile_link', 'certifications', 'soft_skills',
            'technical_skills', 'placement_drives', 'preplacement_activities','password'
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Additional validation for 'Placed' status
        if data['placement_status'].strip().lower() == 'placed':
            placed_required_fields = ['package', 'placement_date', 'placement_drive_id']
            for field in placed_required_fields:
                if field not in data or not data[field]:
                    return jsonify({"error": f"Missing required field for 'Placed' status: {field}"}), 400

        # Extract student data
        student_data = {
            'full_name': data['full_name'],
            'email': data['email'],
            'phone_number': data['phone_number'],
            'roll_no': data['roll_no'],
            'batch_year': data['batch_year'],
            'placement_status': data['placement_status'],
            'created_at': datetime.now(),
            'password':data['password']
            
        }

        try:
            # Use the MySQLConnector to establish a connection
            connection = current_app.db_pool.connect()          
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            # Create a cursor to execute queries
            cursor = connection.cursor()

            # Insert into Students table
            cursor.execute("""
                INSERT INTO Students (full_name, email, phone_number, roll_no, batch_year, placement_status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (student_data['full_name'], student_data['email'], student_data['phone_number'], student_data['roll_no'],
                student_data['batch_year'], student_data['placement_status'], student_data['created_at']))
            student_id = cursor.lastrowid  # Get the inserted student's ID

            # Insert into StudentProfiles table
            cursor.execute("""
                INSERT INTO StudentProfiles (student_id, platform_name, profile_link)
                VALUES (%s, %s, %s)
            """, (student_id, data['profile_platform_name'], data['profile_link']))

            # If placement_status is 'Placed', insert into PlacedStudents table
            if student_data['placement_status'].strip().lower() == 'placed':
                cursor.execute("""
                    INSERT INTO PlacedStudents (student_id, package, placement_date, placement_drive_id)
                    VALUES (%s, %s, %s, %s)
                """, (student_id, data['package'], data['placement_date'], data['placement_drive_id']))

            # Insert into StudentCertifications table
            for certification in data['certifications']:
                cursor.execute("""
                    INSERT INTO StudentCertifications (student_id, certification_name, certificate_link, certified_by)
                    VALUES (%s, %s, %s, %s)
                """, (student_id, certification['certification_name'], certification['certificate_link'], certification['certified_by']))

            # Insert into SoftSkills table
            for skill in data['soft_skills']:
                cursor.execute("""
                    INSERT INTO SoftSkills (student_id, skill_name, proficiency_level)
                    VALUES (%s, %s, %s)
                """, (student_id, skill['skill_name'], skill['proficiency_level']))

            # Insert into TechnicalSkills table
            for skill in data['technical_skills']:
                cursor.execute("""
                    INSERT INTO TechnicalSkills (student_id, skill_name, proficiency_level)
                    VALUES (%s, %s, %s)
                """, (student_id, skill['skill_name'], skill['proficiency_level']))

            # Insert into PlacementDrives (if any) and StudentRegistrations table
            for drive in data['placement_drives']:
                cursor.execute("""
                    INSERT INTO PlacementDrives (company_name, registration_link, notice_pdf_link, details, start_date, end_date)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (drive['company_name'], drive['registration_link'], drive['notice_pdf_link'], drive['details'],
                    drive['start_date'], drive['end_date']))
                drive_id = cursor.lastrowid  # Get the inserted drive's ID

                # Register the student for the drive
                cursor.execute("""
                    INSERT INTO StudentRegistrations (student_id, drive_id)
                    VALUES (%s, %s)
                """, (student_id, drive_id))

            # Insert into PreplacementActivities table
            for activity in data['preplacement_activities']:
                cursor.execute("""
                    INSERT INTO PreplacementActivities (activity_name, company, date, description)
                    VALUES (%s, %s, %s, %s)
                """, (activity['activity_name'], activity['company'], activity['date'], activity['description']))
                activity_id = cursor.lastrowid  # Get the inserted activity's ID

                # Register the student for the preplacement activity
                cursor.execute("""
                    INSERT INTO PreplacementActivityRegistrations (student_id, preplacement_activity_id)
                    VALUES (%s, %s)
                """, (student_id, activity_id))



            # insert into users table  
            if student_data["password"]:
                password = student_data["password"] 
            else:
                password = "test"
            print(password)
            
            # user_id = str(uuid.uuid4())
            # Hash the password
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            role = "Student"
            cursor.execute("""
                INSERT INTO usernames (username , password_hash , role , roll_no )
                VALUES (%s, %s, %s, %s)
            """, (student_data['full_name'], password_hash, role,student_data['roll_no'])) 
         
            # Commit all changes
            connection.commit()

            return jsonify({"message": "Student added successfully", "student_id": student_id}), 201

        except Error as e:
            self.logger.error(f"Error while adding student: {e}")
            return jsonify({"error": "Database error"}), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()