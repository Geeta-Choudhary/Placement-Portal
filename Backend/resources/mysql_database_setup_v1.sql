CREATE DATABASE placement_system;

USE placement_system;

-- Table for storing student information including personal details, academic details, and placement status.
CREATE TABLE Students (
  id CHAR(36) PRIMARY KEY,                    -- Unique student identifier
  full_name VARCHAR(255) NOT NULL,       -- Full name of the student
  email VARCHAR(255) NOT NULL UNIQUE,    -- Email address, must be unique
  phone_number VARCHAR(15) NOT NULL,     -- Phone number of the student
  roll_no VARCHAR(10) NOT NULL UNIQUE,   -- Unique roll number for the student
  resume_link VARCHAR(255),              -- Link to the student's resume (optional)
  batch_year INT NOT NULL,               -- Year of admission (batch year)
  auto_register BOOLEAN DEFAULT FALSE,   -- Auto registration flag (default: false)
  placement_status ENUM('Not Placed', 'Placed') DEFAULT 'Not Placed',  -- Placement status (default: 'Not Placed')
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record is created
);

-- Table to store various types of student profiles dynamically (e.g., LeetCode, HackerRank, LinkedIn).
CREATE TABLE StudentProfiles (
  id CHAR(36) PRIMARY KEY,                             -- Unique profile identifier
  student_id CHAR(36) NOT NULL,                        -- Foreign key referencing the student's ID
  platform_name VARCHAR(100) NOT NULL,            -- Platform name (e.g., 'LeetCode', 'HackerRank', 'LinkedIn')
  profile_link VARCHAR(255) NOT NULL,             -- URL to the student's profile on the platform
  FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE  -- Ensures profiles are deleted when a student is deleted
);

-- Table to store student certifications, including certification name, certificate link, and certification authority.
CREATE TABLE StudentCertifications (
  id CHAR(36) PRIMARY KEY,                             -- Unique certification record identifier
  student_id CHAR(36) NOT NULL,                        -- Foreign key referencing the student's ID
  certification_name VARCHAR(255) NOT NULL,       -- Name of the certification
  certificate_link VARCHAR(255) NOT NULL,         -- URL to the certificate
  certified_by VARCHAR(255) NOT NULL,             -- Organization or authority that issued the certification
  FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE  -- Deletes certifications if the student record is deleted
);

-- Table to store student soft skills, including skill name and proficiency level.
CREATE TABLE SoftSkills (
  id CHAR(36) PRIMARY KEY,                                  -- Unique soft skill record identifier
  student_id CHAR(36) NOT NULL,                             -- Foreign key referencing the student's ID
  skill_name VARCHAR(255) NOT NULL,                    -- Name of the soft skill
  proficiency_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,  -- Proficiency level of the skill
  FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE  -- Deletes soft skills if the student record is deleted
);


-- Table to store student technical skills, including skill name and proficiency level.
CREATE TABLE TechnicalSkills (
  id CHAR(36) PRIMARY KEY,                                  -- Unique technical skill record identifier
  student_id CHAR(36) NOT NULL,                             -- Foreign key referencing the student's ID
  skill_name VARCHAR(255) NOT NULL,                    -- Name of the technical skill
  proficiency_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,  -- Proficiency level of the skill
  FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE  -- Deletes technical skills if the student record is deleted
);


-- Table to store information about placement drives, including company details, registration link, and drive duration.
CREATE TABLE PlacementDrives (
  id CHAR(36) PRIMARY KEY,                               -- Unique placement drive record identifier
  company_name VARCHAR(255) NOT NULL,               -- Name of the company hosting the placement drive
  registration_link VARCHAR(255),                   -- URL for registration (optional)
  notice_pdf_link VARCHAR(255),                     -- URL to the placement drive notice in PDF format (optional)
  details TEXT,                                     -- Additional details about the placement drive
  start_date DATE NOT NULL,                         -- Start date of the placement drive
  end_date DATE NOT NULL,                           -- End date of the placement drive
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- Timestamp when the record is created
);

-- Table to store student registrations for placement drives, including the registration date.
CREATE TABLE StudentRegistrations (
  id CHAR(36) PRIMARY KEY,                               -- Unique registration record identifier
  student_id CHAR(36) NOT NULL,                          -- Foreign key referencing the student's ID
  drive_id CHAR(36) NOT NULL,                            -- Foreign key referencing the placement drive ID
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the registration occurred
  FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,  -- Deletes registration if the student record is deleted
  FOREIGN KEY (drive_id) REFERENCES PlacementDrives(id) ON DELETE CASCADE  -- Deletes registration if the placement drive record is deleted
);


-- Table to store placement notices, including title, content, read status, and associated drive.
CREATE TABLE PlacementNotices (
  id CHAR(36) PRIMARY KEY,                                -- Unique notice record identifier
  title VARCHAR(255) NOT NULL,                       -- Title of the placement notice
  content TEXT NOT NULL,                             -- Content of the placement notice
  is_read BOOLEAN DEFAULT FALSE,                     -- Flag to indicate if the notice has been read (default: false)
  drive_id CHAR(36),                                      -- Foreign key referencing the placement drive ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Timestamp when the notice is created
  FOREIGN KEY (drive_id) REFERENCES PlacementDrives(id) ON DELETE SET NULL  -- Sets the drive_id to NULL if the placement drive is deleted
);


-- Table to store general notices, including title, content, read status, and associated drive.
CREATE TABLE GeneralNotices (
  id CHAR(36) PRIMARY KEY,                                -- Unique notice record identifier
  title VARCHAR(255) NOT NULL,                       -- Title of the general notice
  content TEXT NOT NULL,                             -- Content of the general notice
  is_read BOOLEAN DEFAULT FALSE,                     -- Flag to indicate if the notice has been read (default: false)
  drive_id CHAR(36),                                      -- Foreign key referencing the placement drive ID (optional)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP     -- Timestamp when the notice is created
);


-- Table to store details of placed students, including the package, placement date, and associated placement drive.
CREATE TABLE PlacedStudents (
  id CHAR(36) PRIMARY KEY,                                  -- Unique placement record identifier
  student_id CHAR(36) NOT NULL,                             -- Foreign key referencing the student's ID
  package DECIMAL(10,2) NOT NULL,                      -- Salary package offered to the student
  placement_date DATE NOT NULL,                        -- Date when the placement was confirmed
  placement_drive_id CHAR(36),                             -- Foreign key referencing the placement drive ID (optional)
  FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,  -- Deletes the record if the student is deleted
  FOREIGN KEY (placement_drive_id) REFERENCES PlacementDrives(id)  -- No specific ON DELETE action for placement drive, defaults to RESTRICT or SET NULL
);


-- Table to store alumni information, including personal details, job details, and availability for mentorship.
CREATE TABLE Alumni (
  id CHAR(36) PRIMARY KEY,                                 -- Unique alumni record identifier
  full_name VARCHAR(255) NOT NULL,                    -- Full name of the alumni
  email VARCHAR(255) NOT NULL UNIQUE,                 -- Unique email address of the alumni
  phone_number VARCHAR(15),                           -- Phone number of the alumni (optional)
  batch_year INT NOT NULL,                            -- Year of graduation (batch year)
  company VARCHAR(255) NOT NULL,                      -- Current company where the alumni works
  job_role VARCHAR(255) NOT NULL,                     -- Job role of the alumni in the company
  linkedin_profile VARCHAR(255),                      -- LinkedIn profile URL (optional)
  mentorship_available BOOLEAN DEFAULT FALSE,         -- Flag indicating if the alumni is available for mentorship (default: false)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- Timestamp when the record is created
);


-- Table to store placement-related FAQs, including question, answer, and creation timestamp.
CREATE TABLE PlacementFAQs (
  id CHAR(36) PRIMARY KEY,                                -- Unique FAQ record identifier
  question TEXT NOT NULL,                            -- The question related to placement
  answer TEXT NOT NULL,                              -- The answer to the placement-related question
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP     -- Timestamp when the FAQ record is created
);


-- Table to store recommended skills and certifications for a placement drive, including the required skills and certifications.
CREATE TABLE RecommendedSkills (
  id CHAR(36) PRIMARY KEY,                                    -- Unique recommended skills record identifier
  required_skills TEXT NOT NULL,                         -- Required skills for the placement drive
  recommended_certifications TEXT,                       -- Recommended certifications for the placement drive (optional)
  placement_drive_id CHAR(36),                                -- Foreign key referencing the placement drive ID
  FOREIGN KEY (placement_drive_id) REFERENCES PlacementDrives(id)  -- Links the record to a specific placement drive
);


-- Table to store information about guest lectures, including topic, speaker, date, and resources like slides, recording, and notes.
CREATE TABLE GuestLectureResources (
  id CHAR(36) PRIMARY KEY,                                -- Unique guest lecture resource record identifier
  topic VARCHAR(255) NOT NULL,                       -- Topic of the guest lecture
  speaker VARCHAR(255),                              -- Name of the guest lecture speaker (optional)
  date DATE NOT NULL,                                -- Date of the guest lecture
  slides_link VARCHAR(255),                          -- URL to the lecture slides (optional)
  recording_link VARCHAR(255),                       -- URL to the lecture recording (optional)
  notes TEXT                                         -- Additional notes from the lecture (optional)
);

-- Table to store guest lecture registrations by students, including the registration status and relevant details.
CREATE TABLE GuestLectureRegistrations (
  id CHAR(36) PRIMARY KEY,                                -- Unique registration record identifier
  student_id CHAR(36) NOT NULL,                           -- Foreign key referencing the student's ID
  guest_lecture_id CHAR(36) NOT NULL,                     -- Foreign key referencing the guest lecture ID
  registration_done BOOLEAN DEFAULT FALSE,           -- Indicates whether the registration is complete (default: false)
  registration_link VARCHAR(255),                    -- URL to the registration page (optional)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Timestamp when the registration is created
  FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,  -- Deletes the registration if the student record is deleted
  FOREIGN KEY (guest_lecture_id) REFERENCES GuestLectureResources(id) ON DELETE CASCADE  -- Deletes the registration if the guest lecture record is deleted
);


-- Table to store interview feedback from students, including company details, interview experience, and questions asked.
CREATE TABLE InterviewFeedback (
    id CHAR(36) PRIMARY KEY,                                      -- Unique interview feedback record identifier
    student_id CHAR(36) NOT NULL,                                  -- Foreign key referencing the student's ID
    company VARCHAR(255) NOT NULL,                            -- Name of the company where the interview took place
    interview_date DATE NOT NULL,                             -- Date of the interview
    experience TEXT NOT NULL,                                 -- Description of the student's experience in the interview
    difficulty_level ENUM('Easy', 'Medium', 'Hard') NOT NULL, -- Difficulty level of the interview
    questions_asked TEXT,                                    -- Questions asked during the interview (optional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- Timestamp when the feedback is created
    placement_drive_id CHAR(36),                                   -- Foreign key referencing the placement drive (optional)
    FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE, -- Deletes feedback if the student record is deleted
    FOREIGN KEY (placement_drive_id) REFERENCES PlacementDrives(id)  -- Links feedback to a placement drive (optional)
);


-- Table to store detailed questions from the interview, including candidate's responses and interviewer's feedback.
CREATE TABLE InterviewQuestions (
  id CHAR(36) PRIMARY KEY,                                    -- Unique question record identifier
  feedback_id CHAR(36) NOT NULL,                                -- Foreign key referencing the InterviewFeedback record
  question_text TEXT NOT NULL,                             -- The interview question asked to the candidate
  answer_given TEXT,                                      -- The candidate's response (optional)
  interviewer_response TEXT,                               -- Interviewer's feedback on the candidate's answer (optional)
  difficulty_level ENUM('Easy', 'Medium', 'Hard') NOT NULL,  -- Difficulty level of the question
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,          -- Timestamp when the question record is created
  FOREIGN KEY (feedback_id) REFERENCES InterviewFeedback(id) ON DELETE CASCADE  -- Deletes the question if the feedback is deleted
);


-- Table to store preplacement activity details, including activity name, company, date, and description.
CREATE TABLE PreplacementActivities (
  id CHAR(36) PRIMARY KEY,                                   -- Unique preplacement activity record identifier
  activity_name VARCHAR(255) NOT NULL,                  -- Name of the preplacement activity
  company VARCHAR(255),                                -- Company hosting the preplacement activity (optional)
  date TIMESTAMP NOT NULL,                             -- Timestamp when the activity took place
  description TEXT,                                    -- Detailed description of the activity (optional)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP       -- Timestamp when the record is created
);

-- Table to store preplacement activity registrations by students, including registration status and relevant details.
CREATE TABLE PreplacementActivityRegistrations (
  id CHAR(36) PRIMARY KEY,                                   -- Unique registration record identifier
  student_id CHAR(36) NOT NULL,                              -- Foreign key referencing the student's ID
  preplacement_activity_id CHAR(36) NOT NULL,                -- Foreign key referencing the preplacement activity ID
  registration_done BOOLEAN DEFAULT FALSE,              -- Flag indicating whether the registration is complete (default: false)
  registration_link VARCHAR(255),                       -- URL to the registration page (optional)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- Timestamp when the registration is created
  FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,  -- Deletes the registration if the student record is deleted
  FOREIGN KEY (preplacement_activity_id) REFERENCES PreplacementActivities(id) ON DELETE CASCADE  -- Deletes the registration if the preplacement activity record is deleted
);