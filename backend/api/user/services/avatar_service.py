import os
import time
from appwrite.input_file import InputFile
from appwrite.services.storage import Storage
from appwrite.client import Client

class AvatarService:
    def __init__(self):
        self.client = Client()
        self.client.set_endpoint(os.getenv("APPWRITE_ENDPOINT"))
        self.client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
        self.client.set_key(os.getenv("APPWRITE_API_KEY"))

        self.storage = Storage(self.client)
        self.bucket_id = os.getenv("AVATAR_BUCKET_ID")

    def upload_avatar(self, image_file, user_id):
        """ Upload avatar to Appwrite bucket """
        
        try:
            file_extension = image_file.name.split(".")[-1]
            filename = f"avatar_{user_id}_{int(time.time())}.{file_extension}"

            #Upload to the appwrite
            result = self.storage.create_file(
                bucket_id=self.bucket_id,
                file_id=filename,
                file=InputFile.from_path(image_file.temporary_file_path())
            )

            # Get the public url
            avatar_url = f"{os.getenv('APPWRITE_ENDPOINT')}/storage/buckets/{self.bucket_id}/files/{filename}/view"

            return avatar_url
        except Exception as e:
            print(f"Erro uploading avatar: {e}")

    def delete_avatar(self, avatar_url):
        """ Delete avatar from appwrite bucket """
        try:
            file_id = avatar_url.split("/")[-2]
            self.storage.delete_file(
                bucket_id=self.bucket_id,
                file_id=file_id
            )
        except Exception as e:
            print(f"Error deleting avatar: {e}")