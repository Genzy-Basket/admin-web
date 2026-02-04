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
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    path: "/admin/ingredients",
    label: "View Inventory",
    icon: <Carrot size={20} />,
  },
  {
    path: "/admin/ingredients/add",
    label: "Add Ingredient",
    icon: <PlusCircle size={20} />,
  },
  {
    path: "/admin/dishes",
    label: "Manage Dishes",
    icon: <Salad size={20} />,
  },
  {
    path: "/admin/dishes/add",
    label: "Add Dish",
    icon: <CookingPot size={20} />,
  },
  {
    path: "/admin/users",
    label: "Manage Users",
    icon: <Users size={20} />,
  },
];
