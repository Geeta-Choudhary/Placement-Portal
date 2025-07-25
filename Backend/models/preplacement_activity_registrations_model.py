from sqlalchemy import Column, Integer, Boolean, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from models.common_base import CommonBase

class PreplacementActivityRegistration(CommonBase):
    __tablename__ = 'preplacement_activity_registrations'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)
    preplacement_activity_id = Column(Integer, ForeignKey('preplacement_activities.id'), nullable=False)
    registration_done = Column(Boolean, default=False)
    registration_link = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, default="CURRENT_TIMESTAMP")

    # Relationships
    student = relationship('Student', backref='preplacement_activity_registrations')
    preplacement_activity = relationship('PreplacementActivity', backref='preplacement_activity_registrations')

