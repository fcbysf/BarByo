import { supabase } from "../lib/supabase";

/**
 * Upload a logo to the 'logos' bucket
 * @param {File} file The file to upload
 * @param {string} userId The user ID to use for the filename
 * @returns {Promise<string|null>} The public URL of the uploaded logo
 */
export const uploadLogo = async (file, userId) => {
  if (!file) return null;

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `shop-logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading logo:", error.message);
    throw error;
  }
};
