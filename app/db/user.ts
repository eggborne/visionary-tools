import type { SiteUser } from "../vistypes";

const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : 'https://visionary.tools/api';

const validateUser = async (user: SiteUser): Promise<SiteUser | undefined> => {
  try {
    const response = await fetch(`https://visionary.tools/api/users/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log('result.user', result.user)
    return result.user;
  } catch (error) {
    console.error('Error getting user data:', error);
    return undefined;
  }
}

async function getUserData(uid: string, accessToken: string): Promise<SiteUser | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, accessToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const userData = await response.json();
    console.log('getUser userData:', userData);
    userData.authorizations = JSON.parse(userData.authorizations);
    userData.preferences = JSON.parse(userData.preferences);
    return userData;

  } catch (error) {
    console.error('Detailed error:', error);
    throw error;
  }
}


export { getUserData, validateUser };