from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.common_base import CommonBase

class StudentCertification(CommonBase):
    __tablename__ = 'student_certifications'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    certification_name = Column(String(255), nullable=False)
    certificate_link = Column(String(255), nullable=False)
    certified_by = Column(String(255), nullable=False)

    student = relationship('Student', backref='certifications')
