import { Fragment, useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, LayoutGrid, ListIcon } from 'lucide-react';
import styles from './InventoryDisplay.module.css';
import type { Column, ColumnFilter, DatabaseUserData, DataItem, LabelOption, SortConfig, SortOption, VisionaryUser } from '../types';
import { updateUserPreferences } from '../fetch';

const defaultFormatters = {
  text: (value: any) => value?.toString() || value,
  number: (value: any) => value?.toString() || value,
  date: (value: any) => new Date(value).toLocaleDateString()
};

interface InventoryDisplayProps {
  inventoryUser: VisionaryUser;
  currentInventory: DatabaseUserData;
  data: DataItem[];
  labelOptions: Record<string, LabelOption>;
  columnFilters: Record<string, ColumnFilter>;
  columns: Column[];
  openModal: () => void;
}

const InventoryDisplay = ({ data, labelOptions, columnFilters, columns, inventoryUser, openModal }: InventoryDisplayProps) => {
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [groupIdentical, setGroupIdentical] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'width',direction: 'desc' });

  useEffect(() => {
    if (!inventoryUser.preferences) return;
    if (inventoryUser.preferences?.sortConfig !== sortConfig) {
      setSortConfig(inventoryUser.preferences.sortConfig);
    }
    if (inventoryUser.preferences?.viewMode !== viewMode) {
      setViewMode(inventoryUser.preferences.viewMode);
    }
    if (inventoryUser.preferences?.groupIdentical !== groupIdentical) {
      setGroupIdentical(inventoryUser.preferences.groupIdentical);
    }
    setFirstLoadDone(true);
  }, []);

  useEffect(() => {
    if (firstLoadDone) {
      if (inventoryUser.preferences?.viewMode !== viewMode) {
        updateUserPreferences(inventoryUser.visionaryData.uid, inventoryUser.visionaryData.accessToken, 'preferences', { ...inventoryUser.preferences, viewMode }, );
      }
      if (inventoryUser.preferences?.sortConfig !== sortConfig) {
        updateUserPreferences(inventoryUser.visionaryData.uid, inventoryUser.visionaryData.accessToken, 'preferences', { ...inventoryUser.preferences, sortConfig }, );
      }
      if (inventoryUser.preferences?.groupIdentical !== groupIdentical) {
        updateUserPreferences(inventoryUser.visionaryData.uid, inventoryUser.visionaryData.accessToken, 'preferences', { ...inventoryUser.preferences, groupIdentical }, );
      }
    }
  }, [viewMode, sortConfig, groupIdentical])

  const hasIdenticalItems = useMemo(() => {
    const itemSet = new Set();
    for (const item of data) {
      const key = Object.entries(item)
        .filter(([k]) => k !== 'id')
        .map(([_, v]) => JSON.stringify(v))
        .join('|');

      if (itemSet.has(key)) {
        return true;
      }
      itemSet.add(key);
    }
    return false;
  }, [data]);

  const sortData = (items: DataItem[], config: SortConfig) => {
    return [...items].sort((a, b) => {
      let valueA = a[config.key];
      let valueB = b[config.key];

      const comparison = typeof valueA === 'number' && typeof valueB === 'number'
        ? valueA - valueB
        : String(valueA).localeCompare(String(valueB));

      return config.direction === 'asc' ? comparison : -comparison;
    });
  };

  const processedData = useMemo(() => {
    if (!sortConfig) { return; }
    let processed = [...data];
    if (groupIdentical) {
      const groups = data.reduce<Record<string, DataItem & { quantity: number }>>((acc, item) => {
        const key = Object.entries(item)
          .filter(([k]) => k !== 'id')
          .map(([_, v]) => v)
          .join('-');

        if (!acc[key]) {
          acc[key] = { ...item, quantity: 1 };
        } else {
          acc[key].quantity++;
        }
        return acc;
      }, {});
      processed = Object.values(groups);
    }

    return sortConfig.key ? sortData(processed, sortConfig) : processed;
  }, [data, groupIdentical, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => (current && {
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown className={styles.sortIcon} />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp className={`${styles.sortIcon} ${styles.active}`} />
      : <ArrowDown className={`${styles.sortIcon} ${styles.active}`} />;
  };

  const processItem = (item: DataItem) => {
    const processedItem = { ...item };
    for (const key in columnFilters) {
      if (processedItem[key] !== null && processedItem[key] !== undefined && labelOptions[key] && labelOptions[key].specialType) {
        const specialType = labelOptions[key].specialType;
        if (columnFilters[specialType].prepend) {
          processedItem[key] = columnFilters[specialType].prepend + processedItem[key];
        }
        if (columnFilters[specialType].append) {
          processedItem[key] = processedItem[key] + columnFilters[specialType].append;
        }
        if (columnFilters[specialType].replace) {
          if (processedItem[key]) {
            processedItem[key] = columnFilters[specialType].replace[processedItem[key]];
          } else if (processedItem.specialType === 'boolean') {}
        }
      }
    }
    return processedItem;
  };

  const renderCell = (item: DataItem, column: Column) => {
    const formatter = column.format || defaultFormatters[column.type] || undefined;
    let cellContent = formatter ? formatter(item[column.key]) : item[column.key];
    cellContent = processItem(item)[column.key];
    return cellContent;
  };

  const sortOptions: SortOption[] = useMemo(() =>
    columns.map(col => ({
      value: col.key,
      label: col.label
    })), [columns]);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortConfig(prev => ({ ...prev, key: event.target.value, direction: prev?.direction || 'asc' }));
  };

  const toggleSortDirection = (): void => {
    setSortConfig(prev => prev ? ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }) : prev);
  };

  return (
    <div className={styles.InventoryDisplay}>
      <button type='button' className={styles.addButton} onClick={openModal}>
        Add new
      </button>

      <div className={styles.controls}>
        <div className={styles.viewControls}>
          <label className={`${viewMode === 'table' ? styles.active : ''}`}>
            <button
              onClick={() => setViewMode('table')}
              className={styles.viewButton}
              aria-label="Table view"
            >
              <ListIcon size={20} />
            </button>
            <span>Table</span>
          </label>
          <label className={`${viewMode === 'grid' ? styles.active : ''}`}>
            <button
              onClick={() => setViewMode('grid')}
              className={styles.viewButton}
              aria-label="Grid view"
            >
              <LayoutGrid size={20} />
            </button>
            <span>Grid</span>
          </label>
        </div>

        {sortConfig && <div className={styles.sortControls}>
          <div className={styles.sortSelect}>
            <span className={styles.sortLabel}>Sort by:</span>
            <select
              className={styles.select}
              value={sortConfig.key}
              onChange={handleSortChange}
            >
              <option value="">None</option>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {sortConfig.key && (
            <button
              className={styles.directionButton}
              onClick={toggleSortDirection}
              type="button"
              aria-label={`Sort ${sortConfig.direction === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortConfig.direction === 'asc' ? <ArrowUp /> : <ArrowDown />}
            </button>
          )}
        </div>}
      </div>

      <div className={styles.checkboxOptions}>
        {hasIdenticalItems && (
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={groupIdentical}
              onChange={(e) => setGroupIdentical(e.target.checked)}
              className={styles.toggleInput}
            />
            Group identical
          </label>
        )}
      </div>

      {viewMode === 'grid' ? (
        <div className={styles.cardContainer}>
          {processedData && processedData.map((item, index) => (
            <div key={item.id || index} className={styles.card}>
              <div className={styles.mainInfo}>
                {item.id && <div className={styles.id}> {(!groupIdentical || item.quantity === 1) && item.id}</div>}
                <div className={styles.title}>{item.title === '' ? '[no title]' : item.title}</div>

                <div className={styles.dimensions}>
                  {['width', 'height', 'depth'].map(dim =>
                    item[dim] != null && (
                      <div key={dim} className={styles.dimension}>
                        <span className={styles.dimensionLabel}>
                          {dim[0].toUpperCase()}
                        </span>
                        <span className={styles.dimensionValue}>
                          {item[dim]}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className={styles.metadata}>
                  {columns
                    .filter(col => !['id', 'title', 'width', 'height', 'depth'].includes(col.key))
                    .map(col => item[col.key] != null && (
                      <Fragment key={col.key}>
                        <div className={styles.label}>{col.label}:</div>
                        <div>{renderCell(item, col)}</div>
                      </Fragment>
                    ))}
                </div>
              </div>
              {groupIdentical && hasIdenticalItems && <div className={styles.quantity}>{item.quantity || 1}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key)}
                    className={styles.tableHeader}
                  >
                    <div className={styles.headerContent}>
                      {(labelOptions[column.key] && labelOptions[column.key].shortName) || column.label}
                      <SortIcon columnKey={column.key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData && processedData.map((item) => (
                <tr key={item.id}>
                  {columns.map((column) => (
                    <td key={`${item.id}-${column.key}`}>
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryDisplay;