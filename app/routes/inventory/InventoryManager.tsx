import { useCallback, useEffect, useMemo, useState } from 'react'
import style from './InventoryManager.module.css';
import type { Column, DatabaseUserData, InventoryItem } from './types';
import { getInventory, updateUserPreferences } from './fetch'
// import AddItemModal from './AddItemModal';
import ThemeToggle from './components/ThemeToggle';
import InventoryDisplay from './components/InventoryDisplay';
import DatabaseSelection from './components/DatabaseSelection';
import { useAuth } from '~/context/AuthContext';

const generateColumnsFromData = (data: any[]): Column[] => {
  if (data.length === 0) return [];

  const booleanColumns = [
    'urgent',
    'wired',
    'signed',
    'wrapped',
  ];

  return Object.entries(data[0]).map(([key, value]) => {
    const nextColumn: Column = {
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      type: typeof value === 'number' ? 'number' :
        key === 'created_at' || key === 'updated_at' ? 'date' : 'text',
      isBoolean: booleanColumns.includes(key),
    }
    if (['width', 'height', 'depth'].includes(key)) {
      nextColumn.label = nextColumn.label[0];
    }
    return (nextColumn)
  })
};

const InventoryManager = () => {
  const { user, setUser, loading } = useAuth();
  
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(user?.preferences?.darkMode || null);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(user?.preferences?.lastDatabase || null);

  const loaded = user && !loading;

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const fetchInv = async (dbName: string, uid: string, accessToken: string) => {
    const startTime = Date.now();
    const items = await getInventory(dbName, uid, accessToken);
    setInventoryData(items);
    console.warn(items.length, 'items fetched in', (Date.now() - startTime), 'ms');
  }

  const handleSelectionChange = useCallback((databaseName: string) => {
    if (user?.authorizations?.inventory?.databases) {
      if (user.accessToken && databaseName) {
        setSelectedDatabase(databaseName);
        updateUserPreferences(user.uid, user.accessToken, 'preferences', { ...user.preferences, lastDatabase: databaseName });
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const dbNameList = Object.keys(user.authorizations.inventory.databases);
      if (!selectedDatabase) {
        if (user.preferences.lastDatabase !== undefined) {
          setSelectedDatabase(user.preferences.lastDatabase);
        } else {
          setSelectedDatabase(user?.authorizations?.inventory[0]);
        }
      }
      if (user.preferences.darkMode !== isDarkMode) {
        toggleDarkMode(user.preferences.darkMode);
      }
      if (dbNameList.length > 0 && selectedDatabase && user.accessToken) {
        console.log('fetching inventory data for', selectedDatabase);
        const nextDatabaseName = selectedDatabase;
        nextDatabaseName && fetchInv(nextDatabaseName || '', user.uid, user.accessToken);
      }
    }
  }, [user, selectedDatabase]);

  useEffect(() => {
    if (inventoryData.length > 0) {
      setColumns(generateColumnsFromData(inventoryData));
    }
  }, [inventoryData]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.style.setProperty('--background-color', '#242424');
      document.documentElement.style.setProperty('--text-color', '#ffffffde');
      document.documentElement.style.setProperty('--accent-color', '#333');
      document.documentElement.style.setProperty('--odd-line-color', '#ffffff0d');
    } else {
      document.documentElement.style.setProperty('--background-color', '#dedede');
      document.documentElement.style.setProperty('--text-color', '#18181b');
      document.documentElement.style.setProperty('--accent-color', '#ccc');
      document.documentElement.style.setProperty('--odd-line-color', '#0000000d');
    }
    if (user) {
      const nextUser = { ...user, preferences: { ...user.preferences, darkMode: isDarkMode } };
      user.accessToken && updateUserPreferences(user.uid, user.accessToken, 'preferences', { ...nextUser.preferences });
    }
  }, [isDarkMode, user]);

  const toggleDarkMode = (newDarkState: boolean) => {
    setIsDarkMode(newDarkState);
    if (user) {
      setUser({ ...user, preferences: { ...user.preferences, darkMode: newDarkState } });
    }
  }

  const memoizedData = useMemo(() => inventoryData, [inventoryData]);
  const memoizedColumns = useMemo(() => columns, [columns]);

  return (
    <div className={style.InventoryManager}>
      <div className={style.header}>
          {user ?
            <>
              <div className={style.userInfo}>
                <img src={user.photoURL || ''} alt={user.displayName || ''} />
                <div>{user.displayName}</div>
              </div>
              <DatabaseSelection
                databases={Object.values(user.authorizations.inventory.databases || {}) || []}
                selectedDatabase={selectedDatabase}
                onDatabaseSelect={handleSelectionChange}
              />
            </>
            :
            <>
              <div className={style.userInfo}>
                <div>{'loading...'}</div>
              </div>
            </>
          }
          <ThemeToggle isDarkMode={isDarkMode || false} onToggle={() => toggleDarkMode(!isDarkMode)} />
      </div>
      <div className={style.main} style={{ opacity: loaded ? 1 : 0 }}>
        {(user && selectedDatabase && memoizedData.length > 0 && memoizedColumns.length > 0) ?
          <InventoryDisplay
            data={memoizedData}
            columns={memoizedColumns}
          />
          :
          <div>loading...</div>
        }
        {/* {selectedDatabase &&
          <AddItemModal
            columns={columns}
            isOpen={isModalOpen}
            selectedDatabase={selectedDatabase?.databaseMetadata.databaseName}
            onClose={closeModal}
          />} */}
      </div>
      <footer className={style.footer}>made with ❤️ by mike@mikedonovan.dev</footer>
    </div>
  )
}

export default InventoryManager;
