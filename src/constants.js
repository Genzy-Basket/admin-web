// constants.js
export const PRODUCT_CATEGORIES = [
  "vegetables",
  "fruits",
  "dairy",
  "meat",
  "bakery",
  "snacks",
  "beverages",
  "staples", // Rice, Grains, Flours
  "oils",
  "personal care",
  "household",
  "baby care",
];

export const PRODUCT_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "pc",
  "pkt",
  "dz",
  "unit",
  "bunch",
  "tray",
];

export const BELLY_SIZE = ["small", "standard", "hearty"];

export const MEAL_TYPES = ["breakfast", "lunch", "snack", "dinner"];

export const DIETARY_TAGS = [
  "high-protein", "low-carb", "low-fat", "gluten-free", "dairy-free",
  "keto", "paleo", "sugar-free", "nut-free", "fiber-rich",
];

export const CUISINES = [
  "south-indian", "north-indian", "chinese", "continental", "italian",
  "street-food", "desserts", "salads", "smoothies", "other",
];

export const INGREDIENT_STATUSES = ["essential", "optional", "seasonal"];

export const INITIAL_DISH_FORM_STATE = {
  title: "",
  description: "",
  imageUrl: "",
  videoUrl: "",
  prepTimeMinutes: "",
  calories: "",
  servesCount: 1,
  isVeg: true,
  available: true,
  cuisine: "",
  mealTypes: [],
  dietaryTags: [],
  ingredients: [],
  instructions: [""],
  keywords: [],
};

export const INITIAL_FORM_STATE = {
  name: "",
  brand: "",
  description: "",
  category: "vegetables",
  subCategory: "",
  isVeg: true,
  isFMCG: false,
  available: true,
  taxRate: 0,
  keywords: [],
  priceConfigs: [
    {
      displayLabel: "Small Pack",
      quantity: 1,
      unit: "kg",
      price: "",
      mrp: "",
      stock: 0,
    },
  ],
};
