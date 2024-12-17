import { User } from "../types";

type AuthorizationUpdate = {
  uid: string;
  authorizations: Record<string, any>;
};

const getUserData = async (user: User): Promise<User | undefined> => {
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
    return result;
  } catch (error) {
    console.error('Error getting user data:', error);
    return undefined;
  }
}


export { getUserData };