import styles from './AddItemModal.module.css';
import { addNewItem } from '../fetch';
import type { Column, ColumnFilter, LabelOption } from '../types';
import { useAuth } from '~/context/AuthContext';

interface ModalProps {
  isOpen: boolean;
  labelOptions: Record<string, LabelOption>;
  columnFilters: Record<string, ColumnFilter>;
  columns: Column[];
  selectedDatabase: string;
  onClose: () => void;
}

const AddItemModal = ({ isOpen, columns, selectedDatabase, onClose }: ModalProps) => {

  const { user } = useAuth();

  console.log('columns is', columns)

  const handleSubmitItemForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newItem = columns.reduce((acc, column) => {
      const value = formData.get(column.key);
      if (value !== null) {
        if (column.type === 'number') {
          acc[column.key] = parseInt(value.toString(), 10);
        } else {
          acc[column.key] = value.toString();
        }
      }
      return acc;
    }, {} as { [key: string]: string | number });

    console.log('new item', newItem);
    if (user?.accessToken) {
      await addNewItem(selectedDatabase, user.uid, user.accessToken, newItem);
      console.warn('added a canvas!')
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay + (isOpen ? ' ' + styles.active : '')} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmitItemForm}>
          {<div className={styles.formRow + ' ' + styles.multi}>
            <div className={styles.inputColumn}>
              <label htmlFor='width' className={styles.inputLabel}>Width</label>
              <input name='width' id='width' type='number' min='0'></input>
            </div>
            <div className={styles.inputColumn}>
              <label htmlFor='height' className={styles.inputLabel}>Height</label>
              <input name='height' id='height' type='number' min='0'></input>
            </div>
            <div className={styles.inputColumn}>
              <label htmlFor='depth' className={styles.inputLabel}>Depth</label>
              <input name='depth' id='depth' type='number' step={0.125} min={0}></input>
            </div>
          </div>}

          {columns.filter(c => ['width', 'height', 'depth'].indexOf(c.key) === -1).map((column) => (
            <div key={column.key} className={styles.formRow}>
              <label htmlFor={column.key} className={styles.inputLabel}>{column.label}</label>
              <input name={column.key} id={column.key} type={column.type} placeholder={column.key === 'id' ? 'auto' : ''}></input>
            </div>
          ))}

          <button type='submit' className={styles.saveButton}>Add to list</button>
          <button type='button' onClick={onClose} className={styles.cancelButton}>Cancel</button>
        </form>
      </div>
    </div>)
};

export default AddItemModal;
