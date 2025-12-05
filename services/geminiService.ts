import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an image slice using Gemini 2.5 Flash to generate a short description.
 * @param base64Image The base64 string of the image (including data:image/... prefix)
 * @returns A string description of the image content.
 */
export const analyzeImageSlice = async (base64Image: string): Promise<string> => {
  try {
    const base64Data = base64Image.split(',')[1];
    if (!base64Data) {
      throw new Error("Invalid image data");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data
            }
          },
          {
            text: "この画像の断片に何が描かれているか、日本語で簡潔に（20文字以内）説明してください。ファイル名のタグとして使えるような形式が良いです。"
          }
        ]
      }
    });

    return response.text || "解析できませんでした";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "エラーが発生しました";
  }
};