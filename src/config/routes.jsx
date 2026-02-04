import {
  LayoutDashboard,
  Carrot,
  PlusCircle,
  Salad,
  CookingPot,
  Users,
} from "lucide-react";

export const adminRoutes = [
  {
    path: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    path: "ingredients",
    label: "View Inventory",
    icon: <Carrot size={20} />,
  },
  {
    path: "ingredients/add",
    label: "Add Ingredient",
    icon: <PlusCircle size={20} />,
  },
  {
    path: "dishes",
    label: "Manage Dishes",
    icon: <Salad size={20} />,
  },
  {
    path: "dishes/add",
    label: "Add Dish",
    icon: <CookingPot size={20} />,
  },
  {
    path: "users",
    label: "Manage Users",
    icon: <Users size={20} />,
  },
];
