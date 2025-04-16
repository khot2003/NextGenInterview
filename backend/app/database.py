from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

# Select Database
db = client["nextgen_db"]

# Collections
users_collection = db["users"]
interviews_collection = db["interviews"]  # For interview sessions
feedback_collection = db["feedback_collection"]