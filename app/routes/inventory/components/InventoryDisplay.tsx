import styles from './InventoryDisplay.module.css';
import type { Column, DataItem } from '../types';
import { Check, XIcon } from 'lucide-react';
import { MaterialReactTable, type MRT_Cell } from 'material-react-table';


interface InventoryDisplayProps {
  data: DataItem[];
  columns: Column[];
}


const InventoryDisplay = ({ data, columns }: InventoryDisplayProps) => {
  console.log('col', columns)

  const dimensions = ['width', 'height', 'depth'];

  const mappedColumns = columns.map((col) => ({
    accessorKey: col.key,
    header: col.label,
    size: 5,
    muiTableBodyCellProps: (col.isBoolean || dimensions.includes(col.key))
      ? ({ cell }: { cell: MRT_Cell<DataItem> }) => ({
        sx: {
          textAlign: 'center',
        },
      })
      : undefined,
    Cell: col.isBoolean
      ? ({ cell }: { cell: MRT_Cell<DataItem> }) => (
        cell.getValue<number>() === 1 ? (
          <Check style={{ color: 'green' }} />
        ) : (
          <XIcon style={{ color: 'red' }} />
        )
      )
      : undefined, // Default rendering for other types
  }));

  return (
    <div className={styles.InventoryDisplay}>
      <MaterialReactTable
        columns={mappedColumns}
        data={data}
        enableGlobalFilter
        positionGlobalFilter={'left'}
        enableDensityToggle={false}
        enableBottomToolbar={false}
        initialState={{
          showGlobalFilter: true,
          density: 'compact',
          pagination: { pageIndex: 0, pageSize: 1000 },
        }}
        enableStickyHeader
        enableColumnActions={false} // Disable column action buttons
        enableColumnFilters={false} // Disable column filters
        enableRowActions={false} // Disable row action buttons
        muiTopToolbarProps={{
          sx: {
            width: '24rem',
            // margin: 'auto',
            margin: '1rem auto',
          }
        }}
      />

    </div>
  );
};

export default InventoryDisplay;
