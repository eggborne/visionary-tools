import style from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({ isOpen, onConfirm, onCancel }: ConfirmModalProps) => {

  return (
    <div className={style.ConfirmModal + (isOpen ? ' ' + style.open : '')}>
      <div className={style.modalBody}>
        Do you really want to start over?
      </div>
      <div className={style.buttonArea}>
        <button className='red' onClick={onConfirm}>Do it</button>
        <button className='green' onClick={onCancel}>Never mind</button>
      </div>
    </div>
  );
};

export default ConfirmModal;
