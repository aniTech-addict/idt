import { ENHANCE_QUERY, SUGGEST_QUERY } from "@/constants/promts";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function gen_ai(UserPrompt,promptType) {
  let systemPrompt;

  if (promptType === "SUGGESTION"){
    systemPrompt = SUGGEST_QUERY;
  } else {
    systemPrompt = ENHANCE_QUERY;
  }

  console.log(promptType)

  const prompt = `${systemPrompt} \n\n UserPrompt: ${UserPrompt}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Generated text:🤖 ", text);
    // Parse the JSON response - clean the text first
    try {
      // Remove any markdown code blocks if present
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedResponse = JSON.parse(cleanText);
      return parsedResponse;
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw text:", text);
      return { clarity: "clear", message: text, options: [], refined_query: null };
    }
  } catch (error) {
    console.error("Error in gen_ai function:", error);
    throw error;
  }
}
