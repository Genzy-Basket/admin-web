// export const dietaryTags = [
//   // Meal Types
//   "breakfast",
//   "lunch",
//   "dinner",
//   "snack",
//   "brunch",

//   // Dish Types
//   "curry",
//   "rice",
//   "chapati",
//   "bread",
//   "soup",
//   "salad",
//   "dessert",
//   "beverage",

//   // Nutritional
//   "high-protein",
//   "low-carb",
//   "high-fiber",
//   "low-fat",
//   "gluten-free",
//   "dairy-free",

//   // Dietary Preferences
//   "vegan",
//   "keto",
//   "paleo",

//   // Preparation Style
//   "quick-meal",
//   "slow-cook",
//   "no-cook",
//   "one-pot",

//   // Cuisine
//   "indian",
//   "chinese",
//   "italian",
//   "mexican",
//   "thai",

//   // Occasion
//   "festive",
//   "party",
//   "comfort-food",
//   "street-food",
// ].sort();

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
