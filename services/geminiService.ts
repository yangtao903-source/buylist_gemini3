import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY;

// Initialize Gemini client only if API key is present
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const parseAndOrganizeList = async (input: string): Promise<{ name: string; category: string }[]> => {
  if (!ai) {
    console.error("Gemini API Key is missing");
    // Fallback: just return the input split by lines/commas as "General" items
    return input.split(/[\n,]/).map(s => s.trim()).filter(s => s).map(name => ({ name, category: "General" }));
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a helpful shopping assistant. Analyze the following shopping list input. It might be a raw text list, a recipe name, or a sentence describing what to buy. 
      
      Extract individual items and assign them a short, standard supermarket category (e.g., "Produce", "Dairy", "Meat", "Pantry", "Household", "Beverages").
      If the input is a recipe name (e.g., "Lasagna"), generate the ingredients needed for it.
      
      Input: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The name of the item" },
              category: { type: Type.STRING, description: "The category of the item" }
            },
            required: ["name", "category"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error calling Gemini:", error);
    // Fallback on error
    return input.split(/[\n,]/).map(s => s.trim()).filter(s => s).map(name => ({ name, category: "Uncategorized" }));
  }
};