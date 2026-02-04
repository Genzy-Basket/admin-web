import { useEffect, useState } from "react";
import { useIngredients } from "../context/IngredientsContext";
import { dishApi } from "../api/dishApi";
import { userApi } from "../api/userApi";
import { LayoutDashboard, Carrot, UtensilsCrossed, Users } from "lucide-react";

const Dashboard = () => {
  const { ingredients } = useIngredients();
  const [dishes, setDishes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishesData, usersData] = await Promise.all([
          dishApi.getAll(),
          userApi.getAll(),
        ]);
        setDishes(dishesData.data || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Total Ingredients",
      value: ingredients.length,
      icon: Carrot,
      color: "bg-green-500",
      lightBg: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Total Dishes",
      value: dishes.length,
      icon: UtensilsCrossed,
      color: "bg-orange-500",
      lightBg: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "bg-blue-500",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-base sm:text-lg font-semibold text-slate-600 animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <LayoutDashboard className="text-indigo-600" size={24} />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
              Dashboard
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600">
            Welcome to your admin dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.lightBg} p-3 sm:p-4 rounded-xl`}>
                  <stat.icon className={stat.textColor} size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <a
              href="/admin/ingredients/add"
              className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center"
            >
              <p className="font-semibold text-slate-700 text-sm sm:text-base">
                Add New Ingredient
              </p>
            </a>
            <a
              href="/admin/dishes/add"
              className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center"
            >
              <p className="font-semibold text-slate-700 text-sm sm:text-base">
                Create New Dish
              </p>
            </a>
            <a
              href="/admin/users"
              className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center sm:col-span-2 lg:col-span-1"
            >
              <p className="font-semibold text-slate-700 text-sm sm:text-base">
                Manage Users
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
