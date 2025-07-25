from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from models.common_base import CommonBase

class PlacementNotice(CommonBase):
    __tablename__ = 'placement_notices'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    drive_id = Column(Integer, ForeignKey('placement_drives.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(TIMESTAMP, default="CURRENT_TIMESTAMP", nullable=False)

    # Relationship with PlacementDrive
    placement_drive = relationship('PlacementDrive', backref='notices')