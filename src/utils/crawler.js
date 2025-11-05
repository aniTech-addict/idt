import axios from "axios";
import * as cheerio from "cheerio";

// Basic web crawler that extracts links related to a research topic
async function crawlResearchLinks(query, maxLinks = 10) {
  const searchQuery = encodeURIComponent(`${query} research paper`);
  const url = `https://www.google.com/search?q=${searchQuery}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const links = [];

    $("a").each((i, el) => {
      const href = $(el).attr("href");
      if (href && href.startsWith("http") && !href.includes("google")) {
        links.push(href);
      }
    });

    // Filter and trim duplicate URLs
    const uniqueLinks = [...new Set(links)].slice(0, maxLinks);
    return uniqueLinks;
  } catch (err) {
    console.error("❌ Crawl failed:", err.message);
    return [];
  }
}

/**
 * Crawls and extracts paper metadata from search results
 * @param {string} query - Research topic to search for
 * @param {number} maxPapers - Maximum number of papers to extract
 * @returns {Array} Array of paper objects with metadata
 */
async function crawlPaperMetadata(query, maxPapers = 5) {
  const searchQuery = encodeURIComponent(`${query} research paper pdf`);
  const url = `https://www.google.com/search?q=${searchQuery}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const papers = [];

    // Extract paper information from search results
    $('div.g').each((i, element) => {
      if (papers.length >= maxPapers) return false;

      const $el = $(element);
      const title = $el.find('h3').text().trim();
      const link = $el.find('a').attr('href');
      const snippet = $el.find('.VwiC3b').text().trim() || $el.find('span').text().trim();

      // Extract potential author information from snippet
      const authors = extractAuthorsFromSnippet(snippet);

      // Extract year if available
      const year = extractYearFromSnippet(snippet);

      if (title && link) {
        papers.push({
          title: title,
          authors: authors,
          year: year || new Date().getFullYear(),
          url: link,
          abstract: snippet.substring(0, 500), // Truncate for storage
          source: 'crawler',
          crawledAt: new Date().toISOString(),
          tags: [query.toLowerCase()]
        });
      }
    });

    return papers;
  } catch (err) {
    console.error("❌ Paper metadata crawl failed:", err.message);
    return [];
  }
}

/**
 * Extracts author names from search result snippet
 * @param {string} snippet - Search result text
 * @returns {Array} Array of author objects
 */
function extractAuthorsFromSnippet(snippet) {
  // Look for patterns like "Author1, Author2, Author3"
  const authorPatterns = [
    /by\s+([^.]{1,100}?)(?:\s*\d{4}|\s*[-–]|$)/i,
    /([^.]{1,100}?)(?:\s*et al\.|\s*and|\s*&\s*)/i
  ];

  for (const pattern of authorPatterns) {
    const match = snippet.match(pattern);
    if (match) {
      const authorText = match[1].trim();
      // Split by common separators
      const authors = authorText.split(/,\s*|\s+and\s+|\s*&\s*/).slice(0, 3);
      return authors.map(name => ({ name: name.trim() })).filter(author => author.name.length > 0);
    }
  }

  return [{ name: "Unknown Author" }];
}

/**
 * Extracts publication year from search result snippet
 * @param {string} snippet - Search result text
 * @returns {number|null} Publication year or null
 */
function extractYearFromSnippet(snippet) {
  const yearMatch = snippet.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? parseInt(yearMatch[0]) : null;
}

/**
 * Crawls papers and stores them in the context
 * @param {string} query - Research topic
 * @param {number} maxPapers - Maximum papers to crawl
 * @returns {Array} Array of crawled and stored papers
 */
async function crawlAndStorePapers(query, maxPapers = 5) {
  try {
    const papers = await crawlPaperMetadata(query, maxPapers);

    // Import here to avoid circular dependencies
    const { addPaper } = await import('../jsonHandler/manageContext.js');

    const storedPapers = [];
    for (const paper of papers) {
      try {
        const storedPaper = await addPaper(paper);
        storedPapers.push(storedPaper);
      } catch (error) {
        console.error(`Failed to store paper "${paper.title}":`, error);
      }
    }

    return storedPapers;
  } catch (error) {
    console.error("Error in crawlAndStorePapers:", error);
    return [];
  }
}

// Example usage
(async () => {
  const title = "Post-Training Quantization for Large Language Models";
  const links = await crawlResearchLinks(title);
  console.log("🔗 Found links:\n", links);

  // Crawl and store paper metadata
  const papers = await crawlAndStorePapers("machine learning transformers", 3);
  console.log("📄 Stored papers:\n", papers);
})();

export { crawlResearchLinks, crawlPaperMetadata, crawlAndStorePapers };
