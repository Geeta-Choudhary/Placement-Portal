from sqlalchemy import Column, Integer, ForeignKey, Date, DECIMAL
from sqlalchemy.orm import relationship
from models.common_base import CommonBase

class PlacedStudent(CommonBase):
    __tablename__ = 'placed_students'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    package = Column(DECIMAL(10, 2), nullable=False)
    placement_date = Column(Date, nullable=False)
    placement_drive_id = Column(Integer, ForeignKey('placement_drives.id', ondelete='SET NULL'), nullable=True)

    # Relationships
    student = relationship('Student', backref='placements')
    placement_drive = relationship('PlacementDrive', backref='placed_students')