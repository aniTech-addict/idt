import fs from 'fs';
import path from 'path';

const CONTEXT_FILE_PATH = path.join(process.cwd(), 'src', 'context', 'paper_context.json');

/**
 * Reads the paper context data from the JSON file
 * @returns {Object} The paper context data
 */
export function readPaperContext() {
  try {
    if (!fs.existsSync(CONTEXT_FILE_PATH)) {
      // Initialize with default structure if file doesn't exist
      const defaultData = {
        papers: [],
        lastUpdated: new Date().toISOString(),
        version: "1.0"
      };
      writePaperContext(defaultData);
      return defaultData;
    }

    const data = fs.readFileSync(CONTEXT_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading paper context:', error);
    throw new Error('Failed to read paper context data');
  }
}

/**
 * Writes the paper context data to the JSON file
 * @param {Object} data - The data to write
 */
export function writePaperContext(data) {
  try {
    // Ensure the directory exists
    const dir = path.dirname(CONTEXT_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Update lastUpdated timestamp
    data.lastUpdated = new Date().toISOString();

    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(CONTEXT_FILE_PATH, jsonData, 'utf8');
  } catch (error) {
    console.error('Error writing paper context:', error);
    throw new Error('Failed to write paper context data');
  }
}

/**
 * Adds a new paper to the context
 * @param {Object} paper - The paper object to add
 * @returns {Object} The added paper with generated ID
 */
export function addPaper(paper) {
  try {
    const context = readPaperContext();

    // Validate paper object
    if (!paper.title || !paper.authors) {
      throw new Error('Paper must have title and authors');
    }

    // Generate unique ID
    const newPaper = {
      id: generatePaperId(),
      ...paper,
      dateAdded: new Date().toISOString(),
      tags: paper.tags || []
    };

    context.papers.push(newPaper);
    writePaperContext(context);

    return newPaper;
  } catch (error) {
    console.error('Error adding paper:', error);
    throw error;
  }
}

/**
 * Retrieves a paper by ID
 * @param {string} id - The paper ID
 * @returns {Object|null} The paper object or null if not found
 */
export function getPaperById(id) {
  try {
    const context = readPaperContext();
    return context.papers.find(paper => paper.id === id) || null;
  } catch (error) {
    console.error('Error getting paper by ID:', error);
    throw error;
  }
}

/**
 * Retrieves all papers
 * @returns {Array} Array of all papers
 */
export function getAllPapers() {
  try {
    const context = readPaperContext();
    return context.papers;
  } catch (error) {
    console.error('Error getting all papers:', error);
    throw error;
  }
}

/**
 * Updates an existing paper
 * @param {string} id - The paper ID
 * @param {Object} updates - The updates to apply
 * @returns {Object|null} The updated paper or null if not found
 */
export function updatePaper(id, updates) {
  try {
    const context = readPaperContext();
    const paperIndex = context.papers.findIndex(paper => paper.id === id);

    if (paperIndex === -1) {
      return null;
    }

    // Merge updates with existing paper
    context.papers[paperIndex] = {
      ...context.papers[paperIndex],
      ...updates,
      lastModified: new Date().toISOString()
    };

    writePaperContext(context);
    return context.papers[paperIndex];
  } catch (error) {
    console.error('Error updating paper:', error);
    throw error;
  }
}

/**
 * Deletes a paper by ID
 * @param {string} id - The paper ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deletePaper(id) {
  try {
    const context = readPaperContext();
    const initialLength = context.papers.length;
    context.papers = context.papers.filter(paper => paper.id !== id);

    if (context.papers.length < initialLength) {
      writePaperContext(context);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting paper:', error);
    throw error;
  }
}

/**
 * Searches papers by title or authors
 * @param {string} query - The search query
 * @returns {Array} Array of matching papers
 */
export function searchPapers(query) {
  try {
    const context = readPaperContext();
    const lowercaseQuery = query.toLowerCase();

    return context.papers.filter(paper => {
      const titleMatch = paper.title.toLowerCase().includes(lowercaseQuery);
      const authorMatch = paper.authors.some(author =>
        author.name.toLowerCase().includes(lowercaseQuery)
      );
      return titleMatch || authorMatch;
    });
  } catch (error) {
    console.error('Error searching papers:', error);
    throw error;
  }
}

/**
 * Adds a chat message to the history
 * @param {Object} message - The chat message object
 * @returns {Object} The added message with generated ID
 */
export function addChatMessage(message) {
  try {
    const context = readPaperContext();

    // Validate message object
    if (!message.content || !message.role) {
      throw new Error('Chat message must have content and role');
    }

    const newMessage = {
      id: generateMessageId(),
      ...message,
      timestamp: new Date().toISOString()
    };

    if (!context.chatHistory) {
      context.chatHistory = [];
    }

    context.chatHistory.push(newMessage);
    writePaperContext(context);

    return newMessage;
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
}

/**
 * Retrieves all chat messages
 * @returns {Array} Array of all chat messages
 */
export function getChatHistory() {
  try {
    const context = readPaperContext();
    return context.chatHistory || [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
}

/**
 * Retrieves chat messages by user/session
 * @param {string} userId - The user ID to filter by
 * @returns {Array} Array of chat messages for the user
 */
export function getChatHistoryByUser(userId) {
  try {
    const context = readPaperContext();
    return (context.chatHistory || []).filter(message => message.userId === userId);
  } catch (error) {
    console.error('Error getting chat history by user:', error);
    throw error;
  }
}

/**
 * Clears all chat history
 * @returns {boolean} True if cleared successfully
 */
export function clearChatHistory() {
  try {
    const context = readPaperContext();
    context.chatHistory = [];
    writePaperContext(context);
    return true;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
}

/**
 * Deletes a specific chat message by ID
 * @param {string} messageId - The message ID to delete
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteChatMessage(messageId) {
  try {
    const context = readPaperContext();
    const initialLength = context.chatHistory.length;
    context.chatHistory = context.chatHistory.filter(message => message.id !== messageId);

    if (context.chatHistory.length < initialLength) {
      writePaperContext(context);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting chat message:', error);
    throw error;
  }
}

/**
 * Generates a unique ID for a paper
 * @returns {string} Unique paper ID
 */
function generatePaperId() {
  return `paper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a unique ID for a chat message
 * @returns {string} Unique message ID
 */
function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a unique ID for a search result
 * @returns {string} Unique search result ID
 */
function generateSearchResultId() {
  return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Adds a search result to the context
 * @param {Object} searchResult - The search result object
 * @returns {Object} The added search result with generated ID
 */
export function addSearchResult(searchResult) {
  try {
    const context = readPaperContext();

    // Validate search result object
    if (!searchResult.query || !searchResult.results) {
      throw new Error('Search result must have query and results');
    }

    const newSearchResult = {
      id: generateSearchResultId(),
      ...searchResult,
      timestamp: new Date().toISOString()
    };

    if (!context.searchResults) {
      context.searchResults = [];
    }

    context.searchResults.push(newSearchResult);
    writePaperContext(context);

    return newSearchResult;
  } catch (error) {
    console.error('Error adding search result:', error);
    throw error;
  }
}

/**
 * Retrieves all search results
 * @returns {Array} Array of all search results
 */
export function getSearchResults() {
  try {
    const context = readPaperContext();
    return context.searchResults || [];
  } catch (error) {
    console.error('Error getting search results:', error);
    throw error;
  }
}

/**
 * Retrieves a search result by ID
 * @param {string} id - The search result ID
 * @returns {Object|null} The search result or null if not found
 */
export function getSearchResultById(id) {
  try {
    const context = readPaperContext();
    return (context.searchResults || []).find(result => result.id === id) || null;
  } catch (error) {
    console.error('Error getting search result by ID:', error);
    throw error;
  }
}

/**
 * Validates paper data structure
 * @param {Object} paper - The paper object to validate
 * @returns {boolean} True if valid
 */
export function validatePaper(paper) {
  if (!paper || typeof paper !== 'object') {
    return false;
  }

  // Required fields
  if (!paper.title || typeof paper.title !== 'string') {
    return false;
  }

  if (!paper.authors || !Array.isArray(paper.authors)) {
    return false;
  }

  // Validate authors
  for (const author of paper.authors) {
    if (!author.name || typeof author.name !== 'string') {
      return false;
    }
  }

  return true;
}