from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.common_base import CommonBase

class StudentProfile(CommonBase):
    __tablename__ = 'student_profiles'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    platform_name = Column(String(100), nullable=False)
    profile_link = Column(String(255), nullable=False)

    student = relationship('Student', backref='profiles')