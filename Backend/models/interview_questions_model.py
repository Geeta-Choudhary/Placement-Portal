from sqlalchemy import Column, Integer, String, Date, Text, Enum, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from models.common_base import CommonBase

class InterviewFeedback(CommonBase):
    __tablename__ = 'interview_feedback'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)
    company = Column(String(255), nullable=False)
    interview_date = Column(Date, nullable=False)
    experience = Column(Text, nullable=False)
    difficulty_level = Column(Enum('Easy', 'Medium', 'Hard'), nullable=False)
    questions_asked = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, default="CURRENT_TIMESTAMP")
    placement_drive_id = Column(Integer, ForeignKey('placement_drives.id'), nullable=True)

    # Relationships
    student = relationship('Student', backref='interview_feedback')
    placement_drive = relationship('PlacementDrive', backref='interview_feedback')

