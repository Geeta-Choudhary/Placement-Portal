import os
import uuid
from connectors.mysql_connector import MySQLConnector
import pandas as pd

# Create a MySQLConnector object
mysql_connector = MySQLConnector()
# Connect to the MySQL database
mysql_connection = mysql_connector.connect()

cursor = mysql_connection.cursor()

# Load the Excel file
current_dir = os.path.dirname(os.path.abspath(__file__))
excel_file = os.path.join(current_dir, '..', 'resources', 'students_data_v1.xlsx')

df = pd.read_excel(excel_file)


# Function to generate UUID for database ID fields
def generate_id():
    return str(uuid.uuid4())  # This generates a UUID (e.g., 'e8c3f6f9-6093-462b-b90e-cd6391f847be')


# Function to insert student data into the Students table
def insert_student(student):
    student_id = generate_id()  # Generate UUID for student ID
    cursor.execute("""
        INSERT INTO Students (id, full_name, email, phone_number, roll_no, batch_year)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (student_id, student['Full Name'], student['Email address'], student['Phone Number'],
          student['Roll No (2462XX)'], 2025))  # Assuming batch_year is 2025
    mysql_connection.commit()

    return student_id


# Function to insert student profile data into the StudentProfiles table
def insert_student_profile(student_id, platform_name, profile_link):
    profile_id = generate_id()  # Generate UUID for profile ID
    cursor.execute("""
        INSERT INTO StudentProfiles (id, student_id, platform_name, profile_link)
        VALUES (%s, %s, %s, %s)
    """, (profile_id, student_id, platform_name, profile_link))
    mysql_connection.commit()


# Function to insert technical skills into the TechnicalSkills table
def insert_technical_skills(student_id, skills):
    skills_list = skills.split(",")
    for skill in skills_list:
        skill_id = generate_id()  # Generate UUID for skill ID
        cursor.execute("""
            INSERT INTO TechnicalSkills (id, student_id, skill_name, proficiency_level)
            VALUES (%s, %s, %s, 'Intermediate')  # Default proficiency level set to 'Intermediate'
        """, (skill_id, student_id, skill.strip()))
    mysql_connection.commit()


# Loop through each student in the DataFrame and insert the data into the database
for index, row in df.iterrows():
    # Insert the student data into Students table
    student_id = insert_student(row)

    # Insert student profiles (LeetCode, HackerRank, LinkedIn, Github)
    if pd.notna(row['LeetCode profile']):
        insert_student_profile(student_id, 'LeetCode', row['LeetCode profile'])
    if pd.notna(row['HackerRank profile']):
        insert_student_profile(student_id, 'HackerRank', row['HackerRank profile'])
    if pd.notna(row['LinkedIn profile']):
        insert_student_profile(student_id, 'LinkedIn', row['LinkedIn profile'])
    if pd.notna(row['Github profile']):
        insert_student_profile(student_id, 'GitHub', row['Github profile'])

    # Insert technical skills into the TechnicalSkills table
    if pd.notna(row['Technical Skills']):
        insert_technical_skills(student_id, row['Technical Skills'])

# Close the database connection
cursor.close()
mysql_connection.close()

print("Data inserted successfully!")
