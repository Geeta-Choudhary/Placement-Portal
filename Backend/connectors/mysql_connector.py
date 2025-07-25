import os
import mysql.connector
from dotenv import load_dotenv

class MySQLConnector:
    def __init__(self):
        load_dotenv()
        self.host = os.getenv("DB_HOST")
        self.user = os.getenv("DB_USER")
        self.password = os.getenv("DB_PASSWORD")
        self.database = os.getenv("DB_NAME")
        self.connection = None

    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            return self.connection
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return None

    def close(self):
        if self.connection:
            self.connection.close()