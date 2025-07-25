from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from models.common_base import CommonBase

class PreplacementActivity(CommonBase):
    __tablename__ = 'preplacement_activities'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    activity_name = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    date = Column(TIMESTAMP, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, default="CURRENT_TIMESTAMP")