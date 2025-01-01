import styles from './InventoryDisplay.module.css';
import type { Column, InventoryItem } from '../types';
import { Check, XIcon } from 'lucide-react';
import { MaterialReactTable, type MRT_Cell } from 'material-react-table';
import { useMemo, useState } from 'react';


interface InventoryDisplayProps {
  data: DataItem[];
  columns: Column[];
}

interface DataItem {
  id?: string;
  [key: string]: any;
}

interface AggregatedItem extends DataItem {
  quantity: number;
  children: DataItem[];
}

const preprocessData = (data: DataItem[]): AggregatedItem[] => {
  const groupedData: Record<string, AggregatedItem> = {};

  data.forEach((item) => {
    const key = Object.entries(item)
      .filter(([k]) => k !== 'id')
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    if (!groupedData[key]) {
      groupedData[key] = { ...item, quantity: 1, children: [item] };
    } else {
      groupedData[key].quantity += 1;
      groupedData[key].children.push(item);
    }
  });
  return Object.values(groupedData);
};

const InventoryDisplay = ({ data, columns }: InventoryDisplayProps) => {
  const [groupIdentical, setGroupIdentical] = useState<boolean>(true);
  console.log('InventoryDisplay columns', columns);

  const displayData = useMemo(() => {
    if (groupIdentical) {
      return preprocessData(data);
    }
    return data.map((item) => ({ ...item, quantity: 1, children: [] }));
  }, [data, groupIdentical]);
  console.log('Display Data:', displayData);


  const dimensions = ['width', 'height', 'depth'];

  const mappedColumns = [
    ...(groupIdentical
      ? [
        {
          accessorKey: 'quantity',
          header: 'Qty',
          size: 1,
          muiTableBodyCellProps: {
            sx: {
              textAlign: 'center',
            },
          },
          Cell: ({ cell }: { cell: MRT_Cell<AggregatedItem> }) => (cell.getValue<number>()) ?? 1,
        },
      ]
      : []),
    ...columns.filter(c => groupIdentical ? (c.key !== 'id' && c.key !== 'urgent' && c.key !== 'finished') : (c.key !== 'urgent' && c.key !== 'finished')).map((col) => ({
      accessorKey: col.key,
      header: col.label,
      size: 1,
      minSize: 1,
      maxSize: 10,
      muiTableBodyCellProps: (col.isBoolean || dimensions.includes(col.key))
        ? ({ cell }: { cell: MRT_Cell<AggregatedItem> }) => ({
          sx: {
            textAlign: 'center',
          },
        })
        : undefined,
      Cell: col.isBoolean
        ? ({ cell }: { cell: MRT_Cell<AggregatedItem> }) => (
          cell.getValue<number>() === 1 ? (
            <Check style={{ color: 'green' }} />
          ) : (
            <XIcon style={{ color: 'red' }} />
          )
        )
        : col.key === 'id' && groupIdentical
          ? ({ cell }: { cell: MRT_Cell<AggregatedItem> }) => (cell.getValue<string>() === '~' ? '~' : cell.getValue<string>())
          : undefined, // Default rendering for other types
    }))];

  return (
    <div className={styles.InventoryDisplay}>
      <MaterialReactTable
        columns={mappedColumns}
        data={displayData}
        enableGlobalFilter
        positionGlobalFilter={'left'}
        enableDensityToggle={false}
        enableHiding={false}
        enableFullScreenToggle={false} // Disable full screen toggle button
        enableBottomToolbar={false}
        initialState={{
          showGlobalFilter: true,
          density: 'compact',
          pagination: { pageIndex: 0, pageSize: 200 },
        }}
        enableColumnActions={false} // Disable column action buttons
        enableColumnFilters={false} // Disable column filters
        enableRowActions={false} // Disable row action buttons
        muiTableProps={{
          sx: {
            // padding: '1rem',
          }
        }}
        muiTablePaperProps={{
          sx: {
            padding: '1rem',
            backgroundColor: 'var(--background-color)',
          }
        }}
        muiTopToolbarProps={{
          sx: {
            width: '80%',
            margin: '1rem auto',
            backgroundColor: 'transparent',
            '& input': {
              backgroundColor: 'var(--accent-color)',
              color: 'var(--text-color)',
              padding: '0.5rem',
            },
            '& svg': {
              color: 'var(--text-color)',
            },
            '& .MuiInputBase-root': {
              backgroundColor: 'var(--accent-color)',
            }
          }
        }}
        renderTopToolbarCustomActions={() => (
          <button
            onClick={() => setGroupIdentical((prev) => !prev)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {groupIdentical ? 'Ungroup Identical' : 'Group Identical'}
          </button>
        )}
      />

    </div>
  );
};

export default InventoryDisplay;
