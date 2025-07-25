from app import create_app
from dotenv import load_dotenv
from waitress import serve

load_dotenv()

app = create_app()
