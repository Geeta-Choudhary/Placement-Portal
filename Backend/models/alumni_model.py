from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from models.common_base import CommonBase

class Alumni(CommonBase):
    __tablename__ = 'alumni'

    # Column definitions
    id = Column(Integer, primary_key=True, autoincrement=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    phone_number = Column(String(15), nullable=True)
    batch_year = Column(Integer, nullable=False)
    company = Column(String(255), nullable=False)
    job_role = Column(String(255), nullable=False)
    linkedin_profile = Column(String(255), nullable=True)
    mentorship_available = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, nullable=False, default="CURRENT_TIMESTAMP")