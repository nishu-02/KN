import { Client, Databases, Account } from 'appwrite';

export const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = '684ced9100138d2cf451';
export const APPWRITE_DATABASE_ID = '684d542f000cbee2ab8e';
export const APPWRITE_REPORT_COLLECTION_ID = '684d54a1003a51a8528d';

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
