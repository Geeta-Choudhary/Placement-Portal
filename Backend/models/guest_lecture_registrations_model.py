from sqlalchemy import Column, Integer, Boolean, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from models.common_base import CommonBase

class GuestLectureRegistration(CommonBase):
    __tablename__ = 'guest_lecture_registrations'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)
    guest_lecture_id = Column(Integer, ForeignKey('guest_lecture_resources.id'), nullable=False)
    registration_done = Column(Boolean, default=False)
    registration_link = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, default="CURRENT_TIMESTAMP")

    # Relationships
    student = relationship('Student', backref='guest_lecture_registrations')
    guest_lecture = relationship('GuestLectureResource', backref='guest_lecture_registrations')

