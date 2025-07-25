from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from models.common_base import CommonBase

class StudentRegistration(CommonBase):
    __tablename__ = 'student_registrations'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    drive_id = Column(Integer, ForeignKey('placement_drives.id', ondelete='CASCADE'), nullable=False)
    registration_date = Column(TIMESTAMP, default="CURRENT_TIMESTAMP", nullable=False)

    # Relationships with Student and PlacementDrive
    student = relationship('Student', backref='registrations')
    placement_drive = relationship('PlacementDrive', backref='registrations')