from flask import request, jsonify, Blueprint , current_app
from mysql.connector import connect, Error
from connectors.mysql_connector import MySQLConnector
import re
from datetime import datetime

class ProfileServiceRoutes:
    def __init__(self, logger, app, spec):
        self.logger = logger
        self.app = app
        self.spec = spec
        self.db_connector = MySQLConnector()
        self.blueprint = Blueprint("profile_service_routes", __name__)

        # Add the profile route
        self.blueprint.add_url_rule(
            "/student/profile",
            view_func=self.fetch_student_profile,
            methods=["GET"]
        )

        # update
        self.blueprint.add_url_rule(
            "/student/profile/<int:roll_no>",
            view_func=self.update_student_profile,
            methods=["PUT"],
        )

    def fetch_student_profile(self , student_id=None):
        """
        ---
        get:
            summary: Fetch a Student Profile
            description: |
                This endpoint allows fetching a detailed student profile by providing the `student_id` as a query parameter. The profile includes basic information, certifications, skills, placement drives, preplacement activities, notices, interview feedback, and alumni information.
            parameters:
                - name: student_id
                  in: query
                  description: The ID of the student whose profile needs to be fetched.
                  required: true
                  schema:
                    type: integer
                    example: 1
            responses:
                200:
                    description: Student profile was successfully retrieved.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    userProfile:
                                        type: object
                                        properties:
                                            studentId:
                                                type: integer
                                            name:
                                                type: string
                                            email:
                                                type: string
                                            phone:
                                                type: string
                                            rollNo:
                                                type: string
                                            resume:
                                                type: string
                                            batch:
                                                type: integer
                                            autoRegister:
                                                type: boolean
                                            status:
                                                type: string
                                            createdAt:
                                                type: string
                                                format: date-time
                                            profilePlatform:
                                                type: string
                                            profileLink:
                                                type: string
                                    certifications:
                                        type: array
                                        items:
                                            type: object
                                            properties:
                                                name:
                                                    type: string
                                                link:
                                                    type: string
                                                certifiedBy:
                                                    type: string
                                    skills:
                                        type: object
                                        properties:
                                            technical:
                                                type: array
                                                items:
                                                    type: object
                                                    properties:
                                                        name:
                                                            type: string
                                                        proficiency:
                                                            type: string
                                            soft:
                                                type: array
                                                items:
                                                    type: object
                                                    properties:
                                                        name:
                                                            type: string
                                                        proficiency:
                                                            type: string
                                    placementDrives:
                                        type: array
                                        items:
                                            type: object
                                            properties:
                                                company:
                                                    type: string
                                                registrationLink:
                                                    type: string
                                                notice:
                                                    type: string
                                                details:
                                                    type: string
                                                startDate:
                                                    type: string
                                                    format: date-time
                                                endDate:
                                                    type: string
                                                    format: date-time
                                    preplacementActivities:
                                        type: array
                                        items:
                                            type: object
                                            properties:
                                                activity:
                                                    type: string
                                                company:
                                                    type: string
                                                date:
                                                    type: string
                                                    format: date-time
                                                description:
                                                    type: string
                                    notices:
                                        type: object
                                        properties:
                                            general:
                                                type: array
                                                items:
                                                    type: object
                                                    properties:
                                                        title:
                                                            type: string
                                                        content:
                                                            type: string
                                                        isRead:
                                                            type: boolean
                                                        createdAt:
                                                            type: string
                                                            format: date-time
                                            placement:
                                                type: array
                                                items:
                                                    type: object
                                                    properties:
                                                        title:
                                                            type: string
                                                        content:
                                                            type: string
                                                        isRead:
                                                            type: boolean
                                                        createdAt:
                                                            type: string
                                                            format: date-time
                                    interviewFeedback:
                                        type: array
                                        items:
                                            type: object
                                            properties:
                                                company:
                                                    type: string
                                                date:
                                                    type: string
                                                    format: date-time
                                                experience:
                                                    type: string
                                                difficulty:
                                                    type: string
                                                questions:
                                                    type: string
                                    alumni:
                                        type: array
                                        items:
                                            type: object
                                            properties:
                                                name:
                                                    type: string
                                                email:
                                                    type: string
                                                phone:
                                                    type: string
                                                batchYear:
                                                    type: integer
                                                company:
                                                    type: string
                                                jobRole:
                                                    type: string
                                                linkedin:
                                                    type: string
                                                mentorshipAvailable:
                                                    type: boolean
                400:
                    description: Student ID is required.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        example: "Student ID is required"
                404:
                    description: Student not found.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        example: "Student not found"
                500:
                    description: A database error occurred while fetching the student profile.
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    error:
                                        type: string
                                        example: "Database error"
        """
        if not student_id:
            student_id = request.args.get('student_id')  # Get student_id from query parameters

        if not student_id:
            return jsonify({"error": "Student ID is required"}), 400

        main_query = """
            SELECT 
                s.full_name,
                s.email,
                s.roll_no,
                s.batch_year,
                s.placement_status,
                s.phone_number,
                s.resume_link
            FROM 
                Students s
            WHERE s.roll_no = %s;
        """

        social_links_query = """
            SELECT platform_name, profile_link
            FROM StudentProfiles
            WHERE student_id = (
                SELECT id FROM Students WHERE roll_no = %s
            );
        """

        registered_drives_query = """
            SELECT d.company_name,d.details ,d.start_date
            FROM studentregistrations sr
            JOIN placementdrives d ON sr.drive_id = d.id
            WHERE sr.student_id = (
                SELECT id FROM Students WHERE roll_no = %s
            );
        """

        preplacement_activities_query = """
            SELECT pa.activity_name, pa.description, pr.created_at
            FROM preplacementactivityregistrations pr
            JOIN preplacementactivities pa ON pr.preplacement_activity_id = pa.id
            WHERE pr.student_id = (
                SELECT id FROM Students WHERE roll_no = %s
            );
        """
        
        skills_query = """
            SELECT * 
            FROM TechnicalSkills ts
            WHERE ts.student_id = (
                SELECT id FROM Students WHERE roll_no = %s
            );
        """
        #    INSERT INTO PlacedStudents (student_id, package, placement_date, placement_drive_id)
                    # VALUES (%s, %s, %s, %s)
        placement_details_query = """
            SELECT * 
            FROM PlacedStudents ps
            WHERE ps.student_id = (
                SELECT id FROM Students WHERE roll_no = %s
            );
        """
        
        try:
            connection = self.db_connector.connect()
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            cursor = connection.cursor(dictionary=True)

            # Fetch student info
            cursor.execute(main_query, (student_id,))
            student_data = cursor.fetchone()

            if not student_data:
                return jsonify({"error": "Student not found"}), 404

            # Fetch social links
            cursor.execute(social_links_query, (student_id,))
            social_links_raw = cursor.fetchall()

            social_links = []
            seen_urls = set()
            for link in social_links_raw:
                platform = link.get("platform_name", "").strip()
                url = link.get("profile_link", "").strip()
                if not platform or not url or url in seen_urls:
                    continue
                seen_urls.add(url)
                username = url.rstrip("/").split("/")[-1] if "/" in url else "N/A"
                social_links.append({
                    "name": platform.lower(),
                    "username": username,
                    "url": url
                })

           
            # Fetch skills
            cursor.execute(skills_query, (student_id,))
            skills_raw = cursor.fetchall()
            skills = []
            for skill in skills_raw:
                skills.append(skill.get("skill_name"))
            
            # Fetch registered drives
            cursor.execute(registered_drives_query, (student_id,))
            drive_rows = cursor.fetchall()
            
            drive_activities = [
                {
                    "title": f"Registered: {drive['company_name']} Drive",
                    "description": f"Registered for {drive['company_name']} - {drive['details']}",
                    "time": str(drive["start_date"]),
                    "category": "drive"
                }
                for drive in drive_rows
            ]

            # Fetch registered preplacement activities
            cursor.execute(preplacement_activities_query, (student_id,))
            activity_rows = cursor.fetchall()
            
            # Fetch placed details
            cursor.execute(placement_details_query, (student_id,))
            placement_details_rows = cursor.fetchall()
            if placement_details_rows:
                    placement_details_row = placement_details_rows[0]
                    date_str = placement_details_row["placement_date"]

                    try:
                        # Parse date from string format: "Fri, 16 Jan 1970 00:00:00 GMT"
                        date_obj = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %Z")
                        formatted_date = date_obj.strftime("%Y-%d-%m")  # Format as yyyy-dd-mm
                    except Exception:
                        formatted_date = date_str  # Fallback in case of error

                    # Merge placement details into userProfile below
                    placement_detail = {
                        "package": placement_details_row["package"],
                        "placement_date": date_str,
                        "placement_drive_id": placement_details_row["placement_drive_id"]
                    }
            else:
                placement_detail = {}

            print(placement_detail)    
            preplacement_activities = [
                {
                    "title": f"Registered: {activity['activity_name']}",
                    "description": activity["description"],
                    "time": str(activity["created_at"]),
                    "category": "preplacement"
                }
                for activity in activity_rows
            ]

            # Final activities list
            all_activities = drive_activities + preplacement_activities
            all_activities.sort(key=lambda x: x["time"], reverse=True)  # sort by latest time

            # Example: assuming `placement_details_row["placement_date"]` is a datetime object or string in GMT format

            # Parse the string into a datetime object
            # date_obj = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %Z")

            # Format it as "17/4/2025"
            # formatted_date = date_obj.strftime("%-d/%-m/%Y")
            # Build final response
            response = {
                "userProfile": {
                    "name": student_data.get("full_name"),
                    "degree": "MSc(CS)",
                    "profileImage": "profileImage",
                    "status": student_data.get("placement_status", "Not-placed"),
                    "package": placement_detail.get("package", "N/A"),
                    "placement_date": placement_detail.get("placement_date", "N/A"),
                    "placement_drive_id": placement_detail.get("placement_drive_id", "N/A"),
                    "skills": skills,
                    "email": student_data.get("email"),
                    "cgpa": "9.4",
                    "batch": student_data.get("batch_year"),
                    "semester": "2nd",
                    "roll_number": student_data.get("roll_no"),
                    "phone_number":student_data.get("phone_number"),
                    "resume":student_data.get("resume_link"),
                    "academics": [
                        {"label": "10th", "value": "N/A"},
                        {"label": "12th", "value": "N/A"},
                        {"label": "Graduation", "value": "9.4"}
                    ]
                },
                "socialLinks": social_links,
                "pieData": [
                    {"value": 1048, "name": "Coding"},
                    {"value": 735, "name": "Aptitude"},
                    {"value": 580, "name": "Communication"}
                ],
                "barData": [120, 100, 10, 80, 70, 110, 130],
                "activities": all_activities
            }

            return jsonify(response)

        except Error as e:
            self.logger.error(f"Error while fetching student profile: {e}")
            return jsonify({"error": "Database error"}), 500


    def update_student_profile(self, roll_no):
        """
        ---
        put:
          summary: Update a Student Profile
          parameters:
            - name: student_id
              in: path
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
                    userProfile:
                      type: object
                      properties:
                        name:
                          type: string
                        email:
                          type: string
                        phone:
                          type: string
                        rollNo:
                          type: string
                        resume:
                          type: string
                        batch:
                          type: integer
                        autoRegister:
                          type: boolean
                        status:
                          type: string
                        profilePlatform:
                          type: string
                        profileLink:
                          type: string

                    certifications:
                      type: array
                      items:
                        type: object
                        properties:
                          name:
                            type: string
                          link:
                            type: string
                          certifiedBy:
                            type: string

                    skills:
                      type: object
                      properties:
                        technical:
                          type: array
                          items:
                            type: object
                            properties:
                              name:
                                type: string
                              proficiency:
                                type: string
                        soft:
                          type: array
                          items:
                            type: object
                            properties:
                              name:
                                type: string
                              proficiency:
                                type: string

          responses:
            200:
              description: Student profile was successfully updated.
              content:
                application/json:
                  schema:
                    $ref: '#/components/schemas/StudentProfileResponse'
        """
        data = request.get_json() or {}
        user = data.get('userProfile', {})
        certifications = data.get('certifications', [])
        skills = data.get('skills', {})
        profiles = data.get('profiles', [])

        try:
            conn = self.db_connector.connect()
            if conn is None:
                return jsonify({"error": "Unable to connect to the database"}), 500

            cur = conn.cursor()

            # Fetch student_id from roll_no
            cur.execute("SELECT id FROM Students WHERE roll_no = %s", (roll_no,))
            result = cur.fetchone()
            if not result:
                return jsonify({"error": f"No student found with roll number: {roll_no}"}), 404
            
            student_id = result[0]

            # 1) Core student info
            cur.execute("""
                UPDATE Students
                SET full_name       = %s,
                    email           = %s,
                    phone_number    = %s,
                    roll_no         = %s,
                    resume_link     = %s,
                    batch_year      = %s,
                    auto_register   = %s,
                    placement_status= %s
                WHERE id = %s
            """, (
                user.get('name'),
                user.get('email'),
                user.get('phone'),
                user.get('rollNo'),
                user.get('resume'),
                user.get('batch'),
                user.get('autoRegister'),
                user.get('status'),
                student_id
            ))

            # 2) Profile link upsert - clear existing and reinsert
            cur.execute("DELETE FROM StudentProfiles WHERE student_id = %s", (student_id,))
            for profile in profiles:
                cur.execute("""
                    INSERT INTO StudentProfiles (student_id, platform_name, profile_link)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        profile_link = VALUES(profile_link)
                """, (
                    student_id,
                    profile.get('profilePlatform'),
                    profile.get('profileLink')
                ))

            # 3) Certifications
            cur.execute("DELETE FROM StudentCertifications WHERE student_id = %s", (student_id,))
            for cert in certifications:
                cur.execute("""
                    INSERT INTO StudentCertifications
                        (student_id, certification_name, certificate_link, certified_by)
                    VALUES (%s, %s, %s, %s)
                """, (
                    student_id,
                    cert.get('name'),
                    cert.get('link'),
                    cert.get('certifiedBy')
                ))

            # 4) Soft skills
            cur.execute("DELETE FROM SoftSkills WHERE student_id = %s", (student_id,))
            for s in skills.get('soft', []):
                cur.execute("""
                    INSERT INTO SoftSkills
                        (student_id, skill_name, proficiency_level)
                    VALUES (%s, %s, %s)
                """, (
                    student_id,
                    s.get('name'),
                    s.get('proficiency')
                ))

            # 5) Technical skills
            cur.execute("DELETE FROM TechnicalSkills WHERE student_id = %s", (student_id,))
            for t in skills.get('technical', []):
                cur.execute("""
                    INSERT INTO TechnicalSkills
                        (student_id, skill_name, proficiency_level)
                    VALUES (%s, %s, %s)
                """, (
                    student_id,
                    t.get('name'),
                    t.get('proficiency')
                ))

            # Check if student is already placed before inserting 
            if user.get('status', '').strip().lower() == 'placed':
                # Format the placement_date string to a datetime.date object
                try:
                    placement_date = datetime.strptime(user['placement_date'], "%Y-%m-%d").date()
                    print(placement_date)
                except (ValueError, TypeError):
                    return jsonify({"error": "Invalid placement date format. Expected YYYY-MM-DD"}), 400

                # Check if the student is already placed
                cur.execute("DELETE  FROM PlacedStudents WHERE student_id = %s", (student_id,))
                cur.execute("""
                    INSERT INTO PlacedStudents (student_id, package, placement_date, placement_drive_id)
                    VALUES (%s, %s, %s, %s)
                """, (student_id, user['package'], placement_date, user['placement_drive_id']))
              
            else:
                cur.execute("DELETE FROM PlacedStudents WHERE student_id = %s", (student_id,))
            conn.commit()

            # Return the freshly updated profile
            return self.fetch_student_profile(user.get('rollNo'))

        except Error as e:
            self.logger.error(f"Error while updating student profile: {e}")
            return jsonify({"error": "Database error"}), 500
        finally:
            if conn and conn.is_connected():
                cur.close()
                conn.close()