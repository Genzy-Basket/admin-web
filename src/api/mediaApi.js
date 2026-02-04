import axiosClient from "./axiosClient";
import axios from "axios";

export const mediaApi = {
  /**
   * Get signature for Cloudinary upload
   * @param {string} folder - Upload folder name
   * @returns {Promise} Signature data
   */
  getSignature: async (folder) => {
    const response = await axiosClient.get(`/media-upload-signature/${folder}`);
    return response.data;
  },

  /**
   * Upload file to Cloudinary with progress tracking
   * @param {File} file - File to upload
   * @param {string} folder - Upload folder (default: 'food')
   * @param {Function} onProgress - Progress callback (receives percentCompleted)
   * @param {AbortSignal} signal - Optional abort signal
   * @returns {Promise<string>} Secure URL of uploaded image
   */
  uploadToCloudinary: async (
    file,
    folder = "food",
    onProgress = null,
    signal = null,
  ) => {
    try {
      // Get upload signature from backend
      const {
        timestamp,
        signature,
        apiKey,
        cloudName,
        folder: uploadFolder,
      } = await mediaApi.getSignature(folder);

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("api_key", apiKey);
      formData.append("folder", uploadFolder);

      // Upload to Cloudinary with axios for progress tracking
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          signal,
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              onProgress(percentCompleted);
            }
          },
        },
      );

      return response.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  },
};
