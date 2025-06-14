import os
from dotenv import load_dotenv
from appwrite.client import Client

load_dotenv()

def get_appwrite_client() -> Client:
    """
    Initilaizes and return the a secure Appwrite client using env vars.
    """

    endpoint = os.getenv("APPWRITE_ENDPOINT")
    project_id = os.getenv("APPWRITE_PROJECT_ID")
    api_key = os.getenv("APPWRITE_API_KEY")

    if not all([endpoint, project_id, api_key]):
        raise EnviromentError("Appwrite enviroment variables are missing.")\
    
    client = Client()
    client.set_endpoint(endpoint)
    client.set_project(project_id)
    client.set_key(api_key)

    return client