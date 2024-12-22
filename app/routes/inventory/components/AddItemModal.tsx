import styles from './AddItemModal.module.css';
import { addNewItem } from '../fetch';
import type { Column } from '../types';
import { useAuth } from '~/context/AuthContext';

interface ModalProps {
  isOpen: boolean;
  columns: Column[];
  selectedDatabase: string;
  onClose: () => void;
}

const AddItemModal = ({ isOpen, columns, selectedDatabase, onClose }: ModalProps) => {

  const { user } = useAuth()

  const handleSubmitItemForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const quantity = parseInt(formData.get('quantity') as string, 10);
    // const newItem = {
    //   width: parseInt(formData.get('width') as string, 10),
    //   height: parseInt(formData.get('height') as string, 10),
    //   depth: parseInt(formData.get('depth') as string, 10),
    //   location: formData.get('location') as string,
    //   origin: formData.get('origin') as string,
    //   packaging: formData.get('packaging') as string,
    //   notes: formData.get('notes') as string,
    // };

    // replace the above with dynamic object creation from 'columns' prop

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
    if (user) {
    //   for (let i = 0; i < quantity; i++) {
        await addNewItem(selectedDatabase, user.uid, user.accessToken || '', newItem);
        console.warn('added a canvas!')
      // }
    }
    // onClose();
  };

  return (
    <div className={styles.modalOverlay + (isOpen ? ' ' + styles.active : '')} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmitItemForm}>
          {/* <div className={styles.formRow + ' ' + styles.multi}>
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

          {/* replace the above with dynamic mapped list */}
          {columns.map((column) => (
            <div key={column.key} className={styles.formRow}>
              <label htmlFor={column.key} className={styles.inputLabel}>{column.label}</label>
              <input name={column.key} id={column.key} type={column.type}></input>
            </div>
          ))}

          <button type='submit' className={styles.saveButton}>Add to list</button>
          <button type='button' className={styles.cancelButton}>Cancel</button>
        </form>
      </div>
    </div>)
};

export default AddItemModal;
