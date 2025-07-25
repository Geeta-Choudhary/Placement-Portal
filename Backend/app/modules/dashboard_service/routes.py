from flask import Blueprint, jsonify, request ,current_app
from datetime import datetime
import re

from connectors.mysql_connector import MySQLConnector


class DashboardServiceRoutes:
    def __init__(self, logger, app, spec):
        self.logger = logger
        self.app = app
        self.spec = spec
        self.db_connector = MySQLConnector()  # Create an instance of the MySQLConnector
        self.blueprint = Blueprint("dashboard_service_routes", __name__)

        self.blueprint.add_url_rule(
            "/students",
            view_func=self.fetch_students,
            methods=["GET"],
        )

        self.blueprint.add_url_rule(
            "/students/placed",
            view_func=self.fetch_placed_students,
            methods=["GET"],
        )

        self.blueprint.add_url_rule(
            "/notices",
            view_func=self.fetch_notices,
            methods=["GET"],
        )

    def fetch_students(self):
        """
        ---
        get:
            summary: Fetch all students with their details
            description: |
                This endpoint retrieves detailed information about all students in the system.
                The data includes personal details, academic information, placement status,
                skills, and placement drive details for each student.
            parameters:
                - name: status
                  in: query
                  required: false
                  description: The placement status to filter by (either "Placed" or "Not Placed").
                  schema:
                    type: string
                    enum:
                      - "Placed"
                      - "Not Placed"
                - name: batch
                  in: query
                  required: false
                  description: The batch year to filter by (e.g., 2023, 2024, etc.).
                  schema:
                    type: string
            responses:
                200:
                    description: A list of students with their details.
                    content:
                        application/json:
                            schema:
                                type: array
                                items:
                                    type: object
                                    properties:
                                        name:
                                            type: string
                                            description: Full name of the student.
                                        email:
                                            type: string
                                            description: Email address of the student.
                                        phone_number:
                                            type: string
                                            description: Contact number of the student.
                                        roll_number:
                                            type: string
                                            description: Roll number of the student.
                                        profiles:
                                            type: array
                                            items:
                                                type: object
                                                properties:
                                                    platform:
                                                        type: string
                                                        description: Platform name (e.g., LinkedIn, GitHub).
                                                    base_url:
                                                        type: string
                                                        description: URL to the student's profile.
                                                    username:
                                                        type: string
                                                        description: Username used in the platform.
                                        skills:
                                            type: array
                                            items:
                                                type: string
                                            description: List of technical skills the student has.
                                        acadamic_details:
                                            type: object
                                            properties:
                                                CGPA:
                                                    type: string
                                                    description: Student's current CGPA.
                                                year:
                                                    type: string
                                                    description: The academic year of the student.
                                                current_semester:
                                                    type: string
                                                    description: The student's current semester.
                                        placement_details:
                                            type: object
                                            properties:
                                                company:
                                                    type: string
                                                    description: Name of the company the student has been placed in (if any).
                                                package:
                                                    type: string
                                                    description: Placement package (if any).
                                                status:
                                                    type: string
                                                    description: Placement status of the student (e.g., "Not Placed", "Placed").
                500:
                    description: Unable to connect to the database.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """

        # Retrieve the query parameters for status and batch
        status_filter = request.args.get('status')
        batch_filter = request.args.get('batch')

        # Use the MySQLConnector to establish a connection
        connection = current_app.db_pool.connect()

        if connection is None:
            return jsonify({"error": "Unable to connect to the database"}), 500

        # return jsonify({"error": "Unable to connect to the database"}), 500

        cursor = connection.cursor(dictionary=True)
        query = """
        SELECT 
            s.id as id,
            s.full_name AS name,
            s.email,
            s.phone_number,
            s.roll_no AS roll_number,
            s.batch_year,
            sp.platform_name AS platform,
            sp.profile_link AS base_url,
            ts.skill_name AS skills,
            st.CGPA,
            st.current_semester,
            pd.company_name AS company,
            ps.package,
            s.placement_status AS status
        FROM 
            Students s
        LEFT JOIN 
            StudentProfiles sp ON s.id = sp.student_id
        LEFT JOIN 
            TechnicalSkills ts ON s.id = ts.student_id
        LEFT JOIN 
            (SELECT 
                student_id, 
                MAX(CASE WHEN certification_name = 'CGPA' THEN certificate_link ELSE NULL END) AS CGPA,
                s.batch_year AS batch_year,
                MAX(CASE WHEN certification_name = 'CurrentSemester' THEN certificate_link ELSE NULL END) AS current_semester
            FROM 
                StudentCertifications sc
            LEFT JOIN 
                Students s ON s.id = sc.student_id
            WHERE 
                certification_name IN ('CGPA', 'CurrentSemester')
            GROUP BY 
                student_id, batch_year) st ON s.id = st.student_id
        LEFT JOIN 
            PlacedStudents ps ON s.id = ps.student_id
        LEFT JOIN 
            PlacementDrives pd ON ps.placement_drive_id = pd.id
        WHERE 
            (s.placement_status = 'Not Placed' OR s.placement_status = 'Placed')
            AND (s.batch_year = %s OR %s IS NULL)
            AND (s.placement_status = %s OR %s IS NULL);
        """

        # Execute the query with the appropriate filters
        cursor.execute(query, (batch_filter, batch_filter, status_filter, status_filter))
        result = cursor.fetchall()

        # Creating a dictionary to group by student's name
        students = {}

        for row in result:
            student_name = row["name"]

            # If the student's name doesn't exist in the dictionary, create a new entry
            if student_name not in students:
                students[student_name] = {
                    "id":row["id"],
                    "name": student_name,
                    "email": row["email"],
                    "phone_number": row["phone_number"],
                    "roll_number": row["roll_number"],
                    "profiles": [],
                    "skills": [],
                    "acadamic_details": {
                        "CGPA": row["CGPA"] if row["CGPA"] else None,
                        "year": row["batch_year"],
                        "current_semester": row["current_semester"]
                    },
                    "placement_details": {
                        "company": row["company"] if row["company"] else "",
                        "package": row["package"] if row["package"] else "",
                        "status": row["status"]
                    }
                }

            # Collect skills for each student. Append the skills to the list if not already included
            if row["skills"]:
                skills = [skill.strip() for skill in row["skills"].split(",")]
                students[student_name]["skills"].extend(skills)

            # Process profiles: adding profile to the respective student
            if row["platform"] and row["base_url"]:
                profile = {
                    "platform": row["platform"].lower(),
                    "base_url": row["base_url"],
                    "username": row["base_url"].split("/")[-1]
                }

                # Ensure that the platform is unique for each student
                platform_exists = any(p["platform"] == profile["platform"] for p in students[student_name]["profiles"])
                if not platform_exists:
                    students[student_name]["profiles"].append(profile)

        # Convert dictionary to list and remove duplicates in skills
        for student in students.values():
            student["skills"] = list(set(student["skills"]))

        student_list = list(students.values())

        cursor.close()  # Close the cursor
        current_app.db_pool.close(connection)  # Close the database connection

        return jsonify(student_list)

    def fetch_placed_students(self):
        """
        ---
        get:
            summary: Fetch all placed students with their placement details
            description: |
                This endpoint retrieves all students who have been placed, along with their placement details such as the company,
                package, placement date, and a profile image URL.
                All students will have their position hardcoded as "Software Developer".
            responses:
                200:
                    description: A list of placed students with their placement details.
                    content:
                        application/json:
                            schema:
                                type: array
                                items:
                                    type: object
                                    properties:
                                        id:
                                            type: integer
                                            description: The unique identifier of the student.
                                        name:
                                            type: string
                                            description: Full name of the student.
                                        position:
                                            type: string
                                            description: Position for which the student is placed (hardcoded as "Software Developer").
                                        company:
                                            type: string
                                            description: Name of the company where the student is placed.
                                        img_url:
                                            type: string
                                            description: URL to the student's profile image.
                500:
                    description: Unable to fetch the placed students.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """

        # Use the MySQLConnector to establish a connection
        connection = current_app.db_pool.connect()        
        if connection is None:
            return jsonify({"error": "Unable to connect to the database"}), 500

        cursor = connection.cursor(dictionary=True)  # Get a cursor to execute SQL
        query = """
        SELECT 
            s.id, 
            s.full_name AS name,
            ps.package AS package,
            ps.placement_date,
            pd.company_name AS company,
            pd.start_date,
            pd.end_date,
            CONCAT('https://randomuser.me/api/portraits/', s.id, '.jpg') AS img_url
        FROM 
            Students s
        JOIN 
            PlacedStudents ps ON s.id = ps.student_id
        JOIN 
            PlacementDrives pd ON ps.placement_drive_id = pd.id
        WHERE 
            s.placement_status = 'Placed'
            AND (
            (ps.package IS NOT NULL)
            )
        ORDER BY 
            ps.placement_date DESC;
        """  # Query to fetch placed students with placement details

        cursor.execute(query)
        result = cursor.fetchall()

        placed_students = []
        for row in result:
            placed_student = {
                "id": row["id"],
                "name": row["name"],
                "position": "Software Developer",  # Hardcoding the position
                "company": row["company"],
                "img_url": row["img_url"]
            }
            placed_students.append(placed_student)

        cursor.close()  # Close the cursor
        current_app.db_pool.close(connection)  # Close the database connection using MySQLConnector's close method

        return jsonify(placed_students)


    def fetch_notices(self):
        """
        ---
        get:
            summary: Fetch all general notices
            description: |
                This endpoint retrieves all general notices from the system. You can filter by
                `date`, `read` (status), and `type` (currently, the type is hardcoded as "general").
            parameters:
                - name: date
                  in: query
                  description: The date of the notice in 'dd/mm/yyyy' format.
                  required: false
                  schema:
                    type: string
                - name: read
                  in: query
                  description: The read status of the notice ("true" or "false").
                  required: false
                  schema:
                    type: string
                    enum:
                      - "true"
                      - "false"
                - name: type
                  in: query
                  description: The type of notice. Currently, only "general" is supported.
                  required: false
                  schema:
                    type: string
                    enum:
                      - "general"
            responses:
                200:
                    description: A list of general notices.
                    content:
                        application/json:
                            schema:
                                type: array
                                items:
                                    type: object
                                    properties:
                                        id:
                                            type: integer
                                            description: The unique identifier of the notice.
                                        title:
                                            type: string
                                            description: Title of the notice.
                                        description:
                                            type: string
                                            description: Detailed description of the notice.
                                        date:
                                            type: string
                                            description: The date when the notice was created.
                                        read:
                                            type: string
                                            description: Status indicating if the notice has been read ("true"/"false").
                                        type:
                                            type: string
                                            description: The type of the notice (always "general").
                500:
                    description: Unable to fetch the notices.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        description: Error message indicating the failure reason.
        """

        # Use the MySQLConnector to establish a connection
        connection = current_app.db_pool.connect()      
        if connection is None:
            return jsonify({"error": "Unable to connect to the database"}), 500

        cursor = connection.cursor(dictionary=True)  # Get a cursor to execute SQL

        # Constructing the query with optional parameters
        query = "SELECT * FROM generalnotices WHERE 1=1"
        params = []

        # Check if `date` is provided and convert it to YYYY-MM-DD format
        date_filter = request.args.get('date')
        if date_filter:
            try:
                # Convert 'DD/MM/YYYY' to 'YYYY-MM-DD'
                formatted_date = datetime.strptime(date_filter, "%d/%m/%Y").strftime("%Y-%m-%d")
                query += " AND DATE(created_at) = %s"
                params.append(formatted_date)
            except ValueError:
                return jsonify({"error": "Invalid date format. Please use 'DD/MM/YYYY' format."}), 400

        # Check if `read` is provided
        read_filter = request.args.get('read')
        if read_filter:
            query += " AND is_read = %s"
            params.append(1 if read_filter.lower() == 'true' else 0)

        # Check if `type` is provided (always "general" in our case)
        type_filter = request.args.get('type')
        if type_filter:
            # We are ignoring this filter as all notices are "general" by the current logic
            if type_filter != "general":
                return jsonify({"error": "Currently, only 'general' type is supported."}), 400

        cursor.execute(query, params)
        result = cursor.fetchall()

        notices = []
        for row in result:
            notice = {
                "id": row["id"],
                "title": row["title"],
                "description": row["content"],
                "date": row["created_at"].strftime("%d/%m/%Y"),  # Formatting the date as required
                "read": "true" if row["is_read"] else "false",  # Convert is_read (0/1) to "false"/"true"
                "type": "general"  # Hardcoding the type as "general"
            }
            notices.append(notice)

        cursor.close()  # Close the cursor
        current_app.db_pool.close(connection)  # Close the database connection using MySQLConnector's close method

        return jsonify(notices)
