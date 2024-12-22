import style from './FormulaCreator.module.css';
import type { Route } from "../+types/home";
import { useState } from 'react';
import colorsData from './data/colors.json';
import type { IngredientData } from './types';
import ConfirmModal from './components/ConfirmModal/ConfirmModal';
import AddIngredientCard from './components/AddIngredientCard/AddIngredientCard';
import MixDisplay from './components/MixDisplay/MixDisplay';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "visionary.tools | formula creator" },
  ];
}

export default function FormulaCreator() {
  const [ingredients, setIngredients] = useState<IngredientData[]>([{ name: '', totalAmount: 0, pendingAmount: 0 }]);
  const [confirmShowing, setConfirmShowing] = useState<boolean>(false);

  const colors: Record<string, string> = colorsData;

  const createIngredient = () => {
    setIngredients([...ingredients, { name: '', totalAmount: 0, pendingAmount: 0 }]);
  };

  const updateIngredient = (index: number, field: string, value: number | string) => {
    console.log('updating', index, field, value)
    const newIngredients: any = field === 'totalAmount' ?
      ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value, pendingAmount: 0 } : ing
      )
      :
      ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    setIngredients(newIngredients);
  };

  // const removeIngredient = (index: number) => {
  //   setIngredients(ingredients.filter((_, i) => i !== index));
  // };

  const handleSave = () => {
    const total = ingredients.reduce((sum, ing) => sum + (ing.totalAmount || 0), 0);

    const recipe = {
      ingredients: ingredients.map(ing => ({
        name: ing.name,
        ratio: (ing.totalAmount || 0) / total
      }))
    };

    console.log('Saving recipe with ratios:', recipe);
  };

  const getRecipe = (ingredients: any) => {
    const total = ingredients.reduce((sum: any, ing: { totalAmount: any; }) => sum + (ing.totalAmount || 0), 0);

    const recipe = {
      ingredients: ingredients.map((ing: any) => ({
        name: ing.name,
        ratio: (ing.totalAmount || 0) / total
      }))
    };

    return recipe;
  };

  const handleReset = () => {
    setIngredients([{ name: '', totalAmount: 0, pendingAmount: 0 }]);
    setConfirmShowing(false);
  };

  return (
    <div className={style.FormulaCreator}>
      <>
        <datalist id="ingredients-list">
          {Object.keys(colorsData).map((name, i) => (
            <option key={i} value={name} />
          ))}
        </datalist>
        <div className={style.panelHeader}>Define a new mixed color</div>
        <div className={style.panelBody}>
          <MixDisplay ingredients={ingredients} getRecipe={getRecipe} />
          <div className={style.addList}>
            {ingredients.map((ing, i) => (
              <AddIngredientCard key={i} backgroundColor={colors[ing.name]} ingredient={ing} index={i} updateIngredient={updateIngredient} />
            ))}
          </div>
        </div>
        <div className={style.buttonArea}>
          <button className={style.newIngredientButton + ' ' + style.gold} onClick={createIngredient}>
            Add New Ingredient
          </button>
          <button className={style.green} onClick={handleSave}>
            Save Recipe
          </button>
          <button className={style.red} onClick={() => setConfirmShowing(true)}>
            Start Over
          </button>
        </div>
      </>
      <ConfirmModal isOpen={confirmShowing} onConfirm={handleReset} onCancel={() => setConfirmShowing(false)} />
    </div>
  )
}
