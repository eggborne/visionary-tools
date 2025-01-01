import type { DatabaseUserData } from "../types";
import styles from "./DatabaseSelection.module.css";

interface DatabaseSelectionProps {
  databases: DatabaseUserData[];
  selectedDatabase: string | null;
  onDatabaseSelect: (databaseName: string) => void;
}

const DatabaseSelection = ({
  databases,
  selectedDatabase,
  onDatabaseSelect
}: DatabaseSelectionProps) => {
  
  const handleDatabaseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDatabaseSelect(e.target.value);
  }
  return (
    <div className={styles.databaseSelection}>
      <select value={selectedDatabase ? selectedDatabase : ''} onChange={(e) => handleDatabaseSelect(e)}>
        {databases.map((db) => (
          <option key={db.databaseMetadata.databaseName} value={db.databaseMetadata.databaseName}>
            {db.databaseMetadata.displayName}
          </option>
        ))}
      </select>   
    </div>
  );
};

export default DatabaseSelection; 