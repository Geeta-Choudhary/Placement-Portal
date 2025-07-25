from sqlalchemy import Column, Integer, String, Date, Text
from models.common_base import CommonBase

class GuestLectureResource(CommonBase):
    __tablename__ = 'guest_lecture_resources'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    topic = Column(String(255), nullable=False)
    speaker = Column(String(255), nullable=True)
    date = Column(Date, nullable=False)
    slides_link = Column(String(255), nullable=True)
    recording_link = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)