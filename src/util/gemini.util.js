import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function gen_ai(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log(response);
}

await main();