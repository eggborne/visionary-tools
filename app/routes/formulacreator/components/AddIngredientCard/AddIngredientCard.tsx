import style from './AddIngredientCard.module.css';
import type { IngredientData } from '../../types';

interface AddIngredientCardProps {
  ingredient: IngredientData;
  backgroundColor: string;
  index: number;
  updateIngredient: (index: number, field: string, value: number | string) => void;
}



const AddIngredientCard = ({ingredient, backgroundColor, index, updateIngredient}: AddIngredientCardProps) => {

  return (
    <div className={style.colorRow} key={index} style={{ backgroundColor: backgroundColor }}>
      <input
        className={style.ingredientInput}
        placeholder="Ingredient"
        type="text"
        value={ingredient.name}
        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
        list="ingredients-list"
      />
      <input
        className={style.amountInput}
        placeholder='Amount to add'
        type="number"
        value={ingredient.pendingAmount || ''}
        onChange={(e) => updateIngredient(index, 'pendingAmount', Number(e.target.value))}
        min="0"
      />
      <button
        type="button"
        className={style.addButton}
        onClick={() => updateIngredient(index, 'totalAmount', ingredient.totalAmount + ingredient.pendingAmount)}
      >
        Add to mix
      </button>
    </div>
  )
};

export default AddIngredientCard;
