from sqlalchemy import Column, Integer, Text, TIMESTAMP
from models.common_base import CommonBase

class PlacementFAQ(CommonBase):
    __tablename__ = 'placement_faqs'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, default="CURRENT_TIMESTAMP")