import { databases } from './config';
import { APPWRITE_DATABASE_ID, APPWRITE_REPORT_COLLECTION_ID } from './config';

export type Report = {
  $id: string;
  [key: string]: any;
};

export async function getReports(): Promise<Report[]> {
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_REPORT_COLLECTION_ID
    );
    return res.documents as Report[];
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}
