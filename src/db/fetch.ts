import { User, UserData } from "../types";

type AuthorizationUpdate = {
  uid: string;
  authorizations: Record<string, any>;
};

async function addNewUser(user: User): Promise<UserData | undefined> {
  try {
    // Get a fresh token before sending the request
    // const currentUser = getAuth().currentUser;
    // const accessToken = currentUser ? await currentUser.getIdToken(true) : '';

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
    if (result.user.authorizations) {
      result.user.authorizations = JSON.parse(result.user.authorizations);
    }
    return result;
  } catch (error) {
    console.error('Error adding user:', error);
  }
}

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
    console.log('updateUserAuthorizations response:', result);
  } catch (error) {
    console.error('Error updating authorizations:', error);
  }
}


export { addNewUser, updateUserAuthorizations };