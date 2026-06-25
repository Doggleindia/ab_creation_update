// services/geminiService.js
import { GoogleGenAI } from "@google/genai";

// Instantiate the Gemini client lazily so a missing GEMINI_API_KEY doesn't
// crash the whole server at startup — only ticket AI suggestions are affected.
let ai = null;
const getAi = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
};

export const generateAISuggestion = async (userMessage) => {
  try {
    const client = getAi();
    if (!client) {
      return "Thanks for reaching out — our team will review your message and get back to you shortly.";
    }

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

    const response = await client.models.generateContent({
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