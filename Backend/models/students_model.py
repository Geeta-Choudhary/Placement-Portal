from sqlalchemy import Column, Integer, String, Boolean, Enum, TIMESTAMP
from models.common_base import CommonBase
from enums.placement_status import PlacementStatus

class Student(CommonBase):
    __tablename__ = 'students'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    phone_number = Column(String(15), nullable=False)
    roll_no = Column(String(10), nullable=False, unique=True)
    resume_link = Column(String(255), nullable=True)
    batch_year = Column(Integer, nullable=False)
    auto_register = Column(Boolean, default=False)
    placement_status = Column(Enum(PlacementStatus), default=PlacementStatus.NOT_PLACED)
    created_at = Column(TIMESTAMP, nullable=False, default="CURRENT_TIMESTAMP")