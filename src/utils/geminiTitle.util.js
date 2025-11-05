import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyCPx6GzvYFF0vhiZoAsJaxkYPzy08wgr3I');

export default async function gen_ai_title(UserPrompt, context) {
  const systemPrompt = `# System Role / Behavior: You are an AI research assistant with access to real academic papers.
Given a short user query and its conversational context, return only one real research paper title that is most relevant to the topic.
The title must exist in actual academic databases (e.g., arXiv, IEEE, ACM, Springer).
No explanations, summaries, or additional text — output should be in exact format of API RESPONSE

API RESPONSE Example:
Input: "I was exploring transformer efficiency, now I want to look into quantization techniques."
Output: "{title: Transformer Efficiency and Post-Training Quantization for Large Language Models}."`;

  const prompt = `${systemPrompt} \n\n User Query: ${UserPrompt} \n Context: ${context}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Generated title text:🤖 ", text);

    // Extract title from the response format {title: "..."}
    const titleMatch = text.match(/\{title:\s*(.+?)\}/i);
    if (titleMatch) {
      return titleMatch[1].trim().replace(/}$/, '');
    }

    // Fallback: return the text as is if no match
    return text.trim();
  } catch (error) {
    console.error("Error in gen_ai_title function:", error);
    throw error;
  }
}