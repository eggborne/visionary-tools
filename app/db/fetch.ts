import type { User } from "../vistypes";

const API_URL = 'https://visionary.tools/api';

const getUserData = async (user: User): Promise<User | undefined> => {
  try {
    const response = await fetch(`${API_URL}/users/validate`, {
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


export { getUserData };