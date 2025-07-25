from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from models.common_base import CommonBase

class RecommendedSkill(CommonBase):
    __tablename__ = 'recommended_skills'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    required_skills = Column(Text, nullable=False)
    recommended_certifications = Column(Text, nullable=True)
    placement_drive_id = Column(Integer, ForeignKey('placement_drives.id'), nullable=False)

    # Relationship with PlacementDrive
    placement_drive = relationship('PlacementDrive', backref='recommended_skills')