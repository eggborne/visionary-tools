import type { InventoryItem } from './types';

console.log('ENV', process.env.NODE_ENV);

const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : 'https://visionary.tools/api';

async function updateUserPreferences(uid: string, accessToken: string, prop: string, newValue: Record<string, any> | string | number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, accessToken, prop, newValue }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

const getInventory = async (inventoryName: string, uid: string, accessToken: string): Promise<InventoryItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ databaseName: inventoryName, uid, accessToken }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    if (response.status === 200) {
      const inventoryData = await response.json();
      return inventoryData;
    } else {
      throw new Error('Failed to fetch inventory data');
    }
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

const addNewItem = async (inventoryName: string, uid: string, accessToken: string, item: InventoryItem): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inventoryName, uid, accessToken, item }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    if (response.status === 200) {
      return true;
    } else {
      throw new Error('Failed to add item to inventory');
    }
  } catch(error) {
    console.error('Error adding item to inventory:', error);
    throw error;
  }
};


export { addNewItem, getInventory, updateUserPreferences };