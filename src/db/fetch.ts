import { User, UserData } from "../types";

async function addNewUser(user: User): Promise<UserData | undefined> {
  try {
    const response = await fetch('https://visionary.tools/api/addnewuser.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Server Response:', result);
    result.user.authorizations = await JSON.parse(result.user.authorizations);
    return result;
  } catch (error) {
    console.error('Error adding user:', error);
  }
}

type AuthorizationUpdate = {
  uid: string;
  authorizations: Record<string, any>; // JSON object for authorizations
};

async function updateUserAuthorizations(data: AuthorizationUpdate): Promise<void> {
  try {
    const response = await fetch('https://visionary.tools/api/updateauthorizations.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.text();
    console.log('Server Response:', result);
  } catch (error) {
    console.error('Error updating authorizations:', error);
  }
}


export { addNewUser, updateUserAuthorizations };