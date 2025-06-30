export async function savePushToken(userId: string, token: string) {
  try {
    const response = await fetch('http://192.168.29.139:8000/reports/save-push-token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        token: token,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save push token');
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving push token:', error);
    throw error;
  }
}
