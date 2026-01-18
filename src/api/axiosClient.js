import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;

export const getCloudinarySignature = async (folder) => {
  const response = await axiosClient.get(`/media-upload-signature/${folder}`);
  return response.data;
};

export const getAllIngredients = async () => {
  const response = await axiosClient.get(`/ingredient/`);
  return response.data;
};

export const addIngredient = async (data) => {
  const response = await axiosClient.post(`/ingredient/`, data);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await axiosClient.get(`/user/`);
  return response.data;
};

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "your_preset");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await res.json();
  return data.secure_url; // This URL goes into your data
};
