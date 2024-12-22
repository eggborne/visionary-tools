import style from './MixDisplay.module.css';
import type { IngredientData } from '../../types';

interface MixDisplayProps {
  ingredients: IngredientData[];
  getRecipe: (ingredients: any) => any;
}

const MixDisplay = ({ingredients, getRecipe}: MixDisplayProps) => {
  const recipe = getRecipe(ingredients);
  console.log('got recip', recipe)
  return (
    <div className={style.MixDisplay}>
      {ingredients.filter(i => i.name).map((ing, i) => (
        <div className={style.colorListing} key={i}>
          <div className={style.ingredient}>{ing.name}</div>
          <div className={style.totalAmount}>{ing.totalAmount}</div>
          <div className={style.ratio}>{(recipe.ingredients[i].ratio * 100).toFixed(2) || 0}%</div>
        </div>
      ))}
    </div>
  )
};

export default MixDisplay;
