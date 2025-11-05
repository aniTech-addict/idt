import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCPx6GzvYFF0vhiZoAsJaxkYPzy08wgr3I');

// System prompt — defines the research assistant's tone + behavior
const SYSTEM_PROMPT = `
You are a professional research assistant with deep expertise in academic papers.
You explain research clearly, precisely, and contextually — as if mentoring a graduate student.
Focus only on content from the given paper context unless explicitly asked to go beyond.
Maintain a formal yet engaging academic tone.
Consider the conversation history when responding to maintain context and continuity.
`;

/**
 * Chats with the research assistant using paper context and chat history
 * @param {string} userQuery - The user's question
 * @param {string} userId - Optional user identifier for chat history
 * @returns {string} The assistant's response
 */
async function chatWithResearcher(userQuery, userId = "default_user") {
  try {
    // For client-side usage, we'll use a simplified approach
    // The actual context management will be handled server-side via API calls

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro", // you can switch to gemini-2.5-flash-lite for faster responses
      systemInstruction: SYSTEM_PROMPT,
    });

    // Simplified prompt for client-side usage
    const fullPrompt = `
You are a research assistant with knowledge of academic papers. The user is asking: ${userQuery}

Please provide a helpful response about research papers and academic topics.
`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    console.log("\n🧠 Research Assistant:\n", response);
    return response;

  } catch (error) {
    console.error("Error in chatWithResearcher:", error);
    throw error;
  }
}

/**
 * Gets chat history for a specific user (client-side stub)
 * @param {string} userId - The user identifier
 * @returns {Array} Array of chat messages
 */
function getUserChatHistory(userId = "default_user") {
  // Client-side stub - actual implementation would use API calls
  return [];
}

/**
 * Clears chat history for a specific user (client-side stub)
 * @param {string} userId - The user identifier
 */
async function clearUserChatHistory(userId = "default_user") {
  // Client-side stub - actual implementation would use API calls
  return true;
}

// Example run
(async () => {
  try {
    const query = "Explain how the proposed quantization method improves transformer model efficiency.";
    await chatWithResearcher(query, "example_user");
  } catch (error) {
    console.error("Example failed:", error);
  }
})();

export { chatWithResearcher, getUserChatHistory, clearUserChatHistory };
