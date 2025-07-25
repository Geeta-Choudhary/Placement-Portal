from sqlalchemy import Column, Integer, String, Text, Date, TIMESTAMP
from models.common_base import CommonBase

class PlacementDrive(CommonBase):
    __tablename__ = 'placement_drives'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    company_name = Column(String(255), nullable=False)
    registration_link = Column(String(255), nullable=True)
    notice_pdf_link = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(TIMESTAMP, default="CURRENT_TIMESTAMP", nullable=False)