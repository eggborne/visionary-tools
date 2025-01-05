import styles from './InventoryDisplay.module.css';
import type { Column, InventoryItem } from '../types';
import { Check, XIcon } from 'lucide-react';
import { MaterialReactTable, type MRT_Cell } from 'material-react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Switch, FormControlLabel } from '@mui/material';


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
  let processedData = Object.values(groupedData);
  console.log('processedData', processedData);

  return processedData;
};

const hasDuplicates = (data: DataItem[]): boolean => {
  const seen = new Set();
  for (const item of data) {
    const key = Object.entries(item)
      .filter(([k]) => k !== 'id')
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    if (seen.has(key)) {
      return true;
    }
    seen.add(key);
  }
  return false;
};

const InventoryDisplay = ({ data, columns }: InventoryDisplayProps) => {
  const [groupIdentical, setGroupIdentical] = useState<boolean>(true);
  const [hasDuplicateEntries, setHasDuplicateEntries] = useState<boolean>(false);

  useEffect(() => {
    const duplicatesExist = hasDuplicates(data);
    setHasDuplicateEntries(duplicatesExist);

  }, [data, groupIdentical]);

  const displayData = useMemo(() => {
    if (groupIdentical) {
      return preprocessData(data);
    }
    return data.map((item) => ({ ...item, quantity: 1, children: [] }));
  }, [data, groupIdentical, hasDuplicateEntries]);

  const priorityOrder = ['quantity', 'id', 'width', 'height', 'depth', 'location', 'title', 'series', 'type', 'origin', 'packaging', 'price', 'buyer', 'wired', 'signed', 'wrapped', 'notes'];

  const dimensions = ['width', 'height', 'depth'];
  const omittedColumns = ['urgent', 'finished', 'images'];

  const mappedColumns = 
  useMemo(() => {
    const filteredColumns = [...columns]
      .filter((c) =>
        (groupIdentical && hasDuplicateEntries)
          ? !omittedColumns.includes(c.key) && c.key !== 'id'
          : !omittedColumns.includes(c.key)
    );
    
    let finalColumns = [
      ...((groupIdentical && hasDuplicateEntries)
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
            Cell: ({ cell }: { cell: MRT_Cell<AggregatedItem> }) =>
              cell.getValue<number>() ?? 1,
          },
        ]
        : []),
      ...filteredColumns.map((col) => ({
        accessorKey: col.key,
        header: col.label,
        size: 1,
        minSize: 1,
        maxSize: 10,
        muiTableBodyCellProps: (col.isBoolean || dimensions.includes(col.key))
          ? {
            sx: {
              textAlign: 'center',
            },
          }
          : undefined,
        Cell: col.isBoolean
          ? ({ cell }: { cell: MRT_Cell<AggregatedItem> }) =>
            cell.getValue<number>() === 1 ? (
              <Check style={{ color: 'green' }} />
            ) : (
              <XIcon style={{ color: 'red' }} />
            )
          : dimensions.includes(col.key)
            ? ({ cell }: { cell: MRT_Cell<AggregatedItem> }) =>
              cell.getValue<number>() !== null ?
                <span>{cell.getValue<number>() + `"`}</span>
            : undefined    
          : undefined,
      })),
    ];
    console.log('unsorted columns', finalColumns);
    finalColumns = finalColumns.sort((a, b) => {
      if (a.accessorKey === 'quantity') return -1;
      if (b.accessorKey === 'quantity') return 1;
      return (
        priorityOrder.indexOf(a.accessorKey) - priorityOrder.indexOf(b.accessorKey)
      );
    });
    return finalColumns;
  }, [columns, groupIdentical, hasDuplicateEntries]);

  console.log('mapped columns', mappedColumns);

  return (
    <div className={styles.InventoryDisplay}>
      <MaterialReactTable
        columns={mappedColumns}
        data={displayData}
        enableGlobalFilter
        positionGlobalFilter={'left'}
        enableDensityToggle={false}
        // enableHiding={false}
        enableFullScreenToggle={false} // Disable full screen toggle button
        enableBottomToolbar={false}
        initialState={{
          columnVisibility: {
            series: false,
            signed: false,
            wrapped: false,
            wired: false,
          },
          density: 'compact',
          showGlobalFilter: true,
          // pagination: { pageIndex: 0, pageSize: 100 },
        }}
        enablePagination={false}
        enableColumnActions={false} // Disable column action buttons
        // enableColumnFilters={false} // Disable column filters
        enableRowActions={false} // Disable row action buttons        
        muiTablePaperProps={{
          sx: {
            backgroundColor: 'var(--background-color)',
            '& tbody': {
              backgroundColor: 'var(--accent-color) !important',
            },
            '& tr': {
              backgroundColor: 'transparent !important',
              '&:nth-of-type(odd)': {
                backgroundColor: 'var(--odd-line-color) !important',
              },
              color: 'var(--text-color)',
            }
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
        renderTopToolbarCustomActions={() =>
          hasDuplicateEntries && (
            // <button
            //   onClick={() => setGroupIdentical((prev) => !prev)}
            //   style={{
            //     padding: '8px 16px',
            //     backgroundColor: '#007bff',
            //     color: '#fff',
            //     border: 'none',
            //     borderRadius: '4px',
            //     cursor: 'pointer',
            //   }}
            // >
            //   {groupIdentical ? 'Ungroup Identical' : 'Group Identical'}
            // </button>
            <FormControlLabel
              control={
                <Switch
                  checked={groupIdentical}
                  onChange={(e) => setGroupIdentical(e.target.checked)}
                  color="primary"
                  
                />
              }
              label="Group Identical"
              sx={{
                color: 'var(--text-color) !important',
              }}
            />
          )
        }
      />

    </div>
  );
};

export default InventoryDisplay;
