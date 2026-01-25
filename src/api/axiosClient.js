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
  try {
    // Get signature from your backend
    const { timestamp, signature, apiKey, cloudName, folder } =
      await getCloudinarySignature("dishes");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("api_key", apiKey);
    formData.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Upload failed");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
