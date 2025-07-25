from flask import request, jsonify, Blueprint,current_app
from mysql.connector import connect, Error
from connectors.mysql_connector import MySQLConnector

class RemoveStudentServiceRoutes:
    def __init__(self, logger, app, spec):
        self.logger = logger
        self.app = app
        self.spec = spec
        self.db_connector = MySQLConnector()
        self.blueprint = Blueprint("remove_student_service_routes", __name__)

        # Add the RemoveStudent API route
        self.blueprint.add_url_rule(
            "/student/remove",
            view_func=self.remove_student,
            methods=["DELETE"]
        )

    def remove_student(self):
        """
            ---
            delete:
                summary: Remove a student and all related data
                description: |
                    This endpoint removes a student from the system along with all related data. The student's profile, certifications, skills,
                    placements, preplacement activities, interview feedback, and alumni information are all deleted. The request should include
                    the `student_id` as a query parameter. If the `student_id` is missing or invalid, the request will return a `400` error.
                    A successful request will return a `200` status, indicating that the student and all related data have been successfully removed.
                parameters:
                    - name: student_id
                      in: query
                      description: The unique identifier of the student to be removed.
                      required: true
                      schema:
                        type: integer
                responses:
                    200:
                        description: The student and all related data were successfully removed.
                        content:
                            application/json:
                                schema:
                                    type: object
                                    properties:
                                        message:
                                            type: string
                                            description: Success message indicating that the student and related data have been successfully removed.
                    400:
                        description: Bad request due to missing or invalid `student_id` parameter.
                        content:
                            application/json:
                                schema:
                                    type: object
                                    properties:
                                        error:
                                            type: string
                                            description: Error message indicating the missing or invalid `student_id` parameter.
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
        # Get student_id from the query parameters
        student_id = request.args.get('student_id')

        if not student_id:
            return jsonify({"error": "Student ID is required"}), 400

        try:
            # Use the MySQLConnector to establish a connection
            connection = current_app.db_pool.connect()        
            if connection is None:
                return jsonify({"error": "Unable to connect to the database"}), 500
            # Create a cursor to execute queries
            cursor = connection.cursor()

            # Start a transaction
            connection.start_transaction()

            # Remove from StudentRegistrations table
            cursor.execute("DELETE FROM StudentRegistrations WHERE student_id = %s", (student_id,))

            # Remove from PreplacementActivityRegistrations table
            cursor.execute("DELETE FROM PreplacementActivityRegistrations WHERE student_id = %s", (student_id,))

            # Remove from StudentProfiles table
            cursor.execute("DELETE FROM StudentProfiles WHERE student_id = %s", (student_id,))

            # Remove from StudentCertifications table
            cursor.execute("DELETE FROM StudentCertifications WHERE student_id = %s", (student_id,))

            # Remove from SoftSkills table
            cursor.execute("DELETE FROM SoftSkills WHERE student_id = %s", (student_id,))

            # Remove from TechnicalSkills table
            cursor.execute("DELETE FROM TechnicalSkills WHERE student_id = %s", (student_id,))

            # Remove from PreplacementActivities table (if student was linked to any activity)
            cursor.execute("""
                DELETE FROM PreplacementActivities WHERE id IN (
                    SELECT preplacement_activity_id FROM PreplacementActivityRegistrations WHERE student_id = %s
                )
            """, (student_id,))

            # Remove from PlacementDrives table (if student was linked to any drive)
            cursor.execute("""
                DELETE FROM PlacementDrives WHERE id IN (
                    SELECT drive_id FROM StudentRegistrations WHERE student_id = %s
                )
            """, (student_id,))

            # Remove from InterviewFeedback table
            cursor.execute("DELETE FROM InterviewFeedback WHERE student_id = %s", (student_id,))

            # Remove from Alumni table (if student is already an alumni)
            cursor.execute("DELETE FROM Alumni WHERE id = %s", (student_id,))
            
            # Remove from Username table
            query = """
                SELECT roll_no as roll_no FROM Students s where id = (%s);
            """
            cursor.execute(query,(student_id,))
            result = cursor.fetchall()
            for row in result:
                cursor.execute("DELETE FROM usernames WHERE roll_no = %s", (row[0],))

            #  Remove from Students table (the student record itself)
            cursor.execute("DELETE FROM Students WHERE id = %s", (student_id,))
          
            # Commit the transaction
            connection.commit()

            return jsonify({"message": "Student and all related data removed successfully"}), 200

        except Error as e:
            self.logger.error(f"Error while removing student: {e}")
            connection.rollback()  # Rollback the transaction in case of error
            return jsonify({"error": "Database error"}), 500
