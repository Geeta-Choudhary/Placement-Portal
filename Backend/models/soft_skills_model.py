from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from models.common_base import CommonBase
from enums.proficiency_level import ProficiencyLevel

class SoftSkill(CommonBase):
    __tablename__ = 'soft_skills'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    skill_name = Column(String(255), nullable=False)
    proficiency_level = Column(Enum(ProficiencyLevel), nullable=False)

    # Relationship with the Student table
    student = relationship('Student', backref='soft_skills')
