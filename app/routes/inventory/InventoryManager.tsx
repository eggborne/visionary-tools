import { useEffect, useState } from 'react'
import style from './InventoryManager.module.css';
import type { Column, DatabaseUserData, FirebaseUserData, InventoryItem, UserDBData, VisionaryUser } from './types';
import { getInventory, getUser, updateUserPreferences } from './fetch'
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
// import AddItemModal from './AddItemModal';
import ThemeToggle from './components/ThemeToggle';
import InventoryDisplay from './components/InventoryDisplay';
import DatabaseSelection from './components/DatabaseSelection';
import { auth } from '~/firebase';
import AddItemModal from './components/AddItemModal';

const generateColumnsFromData = (data: any[]): Column[] => {
  if (data.length === 0) return [];

  return Object.entries(data[0]).map(([key, value]) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    type: typeof value === 'number' ? 'number' :
      key === 'created_at' || key === 'updated_at' ? 'date' : 'text'
  }))
};

const InventoryManager = () => {
  const [loaded, setLoaded] = useState(false);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseUserData | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [user, setUser] = useState<VisionaryUser | null>(null);

  const fetchInv = async (dbName: string, uid: string, accessToken: string) => {
    const startTime = Date.now();
    const items = await getInventory(dbName, uid, accessToken);
    setInventoryData(items);
    console.warn(items.length, 'items fetched in', (Date.now() - startTime), 'ms');
  }

  const handleSelectionChange = (databaseName: string) => {
    if (user) {
      const nextSelected = Object.values(user?.inventoryData.databases).find(
        db => db.databaseMetadata.databaseName === databaseName
      );
      if (nextSelected) {
        setSelectedDatabase(nextSelected);
        updateUserPreferences(user.visionaryData.uid, user.visionaryData.accessToken, 'preferences', { ...user.preferences, lastDatabase: databaseName });
      }
    }
  };

  useEffect(() => {
    const getUserData = async (firebaseUser: User): Promise<UserDBData | null> => {
      const invUser: FirebaseUserData = {
        accessToken: await firebaseUser.getIdToken(),
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoUrl: firebaseUser.photoURL,
        uid: firebaseUser.uid,
      };
      const userDBData = await getUser(invUser.uid, invUser.accessToken);
      if (userDBData) {
        if (userDBData.preferences.darkMode !== undefined) {
          toggleDarkMode(userDBData.preferences.darkMode);
        } else {
          toggleDarkMode(isDarkMode);
        }

        const nextUser: VisionaryUser = {
          visionaryData: invUser,
          inventoryData: {
            databases: userDBData?.authorizations?.inventory?.databases || [],
          },
        };
        if (userDBData.preferences.lastDatabase !== undefined) {
          console.log('last database:', userDBData.preferences.lastDatabase);
          setSelectedDatabase(nextUser?.inventoryData.databases[userDBData.preferences.lastDatabase]);
        } else {
          setSelectedDatabase(Object.values(nextUser?.inventoryData.databases)[0]);
        }
        nextUser.preferences = userDBData.preferences;
        setUser(nextUser);
      }
      return userDBData || null;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      console.warn('InventoryManager: onAuthStateChanged', firebaseUser);
      if (firebaseUser) {
        getUserData(firebaseUser);
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> user logged in!')
      } else {
        window.location.href = 'https://visionary.tools/';
      }
      setLoaded(true);
    });

    requestAnimationFrame(() => {
      setLoaded(true);
    })
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const dbNameList = Object.keys(user.inventoryData.databases);
      if (dbNameList.length > 0 && selectedDatabase) {
        const nextDatabase = selectedDatabase.databaseMetadata.databaseName
        nextDatabase && fetchInv(nextDatabase || '', user.visionaryData.uid, user.visionaryData.accessToken);
      }
    }
  }, [user, selectedDatabase]);

  useEffect(() => {
    if (inventoryData.length > 0) {
      // First check if columns are defined in database metadata
      // const dbColumns = user?.inventoryData.databases[CURRENT_INVENTORY]?.databaseMetadata.columns;
      const dbColumns = false;
      if (dbColumns) {
        setColumns(dbColumns);
      } else {
        // Generate columns from data if not defined in metadata
        setColumns(generateColumnsFromData(inventoryData));
      }
    }
  }, [inventoryData, user]);

  const toggleDarkMode = (newDarkState: boolean) => {
    setIsDarkMode(newDarkState);
    if (newDarkState) {
      document.documentElement.style.setProperty('--background-color', '#242424');
      document.documentElement.style.setProperty('--text-color', '#ffffffde');
      document.documentElement.style.setProperty('--accent-color', '#444');
      document.documentElement.style.setProperty('--odd-line-color', '#ffffff0d');
    } else {
      document.documentElement.style.setProperty('--background-color', '#dedede');
      document.documentElement.style.setProperty('--text-color', '#18181b');
      document.documentElement.style.setProperty('--accent-color', '#ccc');
      document.documentElement.style.setProperty('--odd-line-color', '#0000000d');
    }
    // localStorage.setItem('darkMode', JSON.stringify(newDarkState));
    if (user) {
      updateUserPreferences(user.visionaryData.uid, user.visionaryData.accessToken, 'preferences', { ...user.preferences, darkMode: newDarkState });
    }
  }

  return (
    <div className={style.InventoryManager}>
      <div className={style.header}>
        {loaded &&
          <>
            {/* <div className='userInfo'> */}
            {user ?
              <>
              <div className={style.userInfo}>
                  <img src={user.visionaryData.photoUrl || ''} alt={user.visionaryData.displayName || ''} />
                  <div>{user.visionaryData.displayName}</div>
                </div>
                <DatabaseSelection
                  databases={Object.values(user?.inventoryData?.databases || {}) || []}
                  selectedDatabase={selectedDatabase}
                  onDatabaseSelect={handleSelectionChange}
                />
              </>
              :
              <>
              <div className={style.userInfo}>
                  {/* <img src={''} alt={''} /> */}
                  <div>{'loading...'}</div>
                </div>
              </>
            }
            {/* </div> */}
            <ThemeToggle isDarkMode={isDarkMode} onToggle={() => toggleDarkMode(!isDarkMode)} />
          </>
        }
      </div>
      <div className={style.main} style={{ opacity: loaded ? 1 : 0 }}>
        {(user && selectedDatabase && inventoryData.length > 0) ?
          <>
            <InventoryDisplay
              currentInventory={selectedDatabase}
              data={inventoryData}
              columns={columns}
              user={user}
              openModal={openModal}
            />
          </>
          :
          <div>loading...</div>
        }
        {selectedDatabase  && <AddItemModal isOpen={isModalOpen} columns={columns} selectedDatabase={selectedDatabase?.databaseMetadata.databaseName} onClose={closeModal} />}
      </div>
      <footer className={style.footer}>made with ❤️ by mike@mikedonovan.dev</footer>
    </div>
  )
}

export default InventoryManager;
