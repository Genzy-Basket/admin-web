import { useState } from "react";
import IngredientForm from "./pages/Ingredient_upload_form";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <IngredientForm></IngredientForm>
    </>
  );
}

export default App;
