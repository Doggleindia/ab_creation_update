// services/geminiService.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateAISuggestion = async (userMessage) => {
  try {
    const prompt = `
You are a professional customer support assistant.

User problem:
"${userMessage}"

Give:
- Short
- Clear
- Simple solution
- Friendly tone
- No technical jargon
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    const aiText =
      response.output_text ||
      response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return "I'm here to help. Could you please explain your issue again?";
    }

    return aiText.trim();

  } catch (error) {
    console.error("Gemini AI Error:", error.message);

    return "Sorry, I'm having trouble responding right now. Please try again later.";
  }
};