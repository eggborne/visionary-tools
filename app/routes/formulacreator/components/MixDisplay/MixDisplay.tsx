import style from './MixDisplay.module.css';
import type { IngredientData } from '../../types';

interface MixDisplayProps {
  ingredients: IngredientData[];
}

const MixDisplay = ({ingredients}: MixDisplayProps) => {

  return (
    <div className={style.MixDisplay}>
      {ingredients.filter(i => i.name).map((ing, i) => (
        <div key={i}>
          <div>{ing.name}</div>
          <div>{ing.totalAmount}</div>
        </div>
      ))}
    </div>
  )
};

export default MixDisplay;
