import axiosClient from "./axiosClient";

export const mediaApi = {
  getSignature: async (folder) => {
    const response = await axiosClient.get(`/media-upload-signature/${folder}`);
    return response.data;
  },

  uploadToCloudinary: async (file, folder = "food") => {
    try {
      const {
        timestamp,
        signature,
        apiKey,
        cloudName,
        folder: uploadFolder,
      } = await mediaApi.getSignature(folder);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("api_key", apiKey);
      formData.append("folder", uploadFolder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  },
};
