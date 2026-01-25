import {
  LayoutDashboard,
  Carrot,
  ShoppingCart,
  PlusCircle,
  User,
  CookingPot,
  Salad,
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
    label: "Manage Dish",
    icon: <Salad size={20} />,
  },
  {
    path: "/admin/dishes/add",
    label: "Add Dishes",
    icon: <CookingPot size={20} />,
  },
  {
    path: "/admin/manage-users/",
    label: "Manage Users",
    icon: <User size={20} />,
  },
  {
    path: "/admin/orders",
    label: "Orders",
    icon: <ShoppingCart size={20} />,
  },
];
