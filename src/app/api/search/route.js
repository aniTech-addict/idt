import { NextResponse } from 'next/server';
import axios from 'axios';
import { addSearchResult } from '../../../jsonHandler/manageContext.js';
import { chatWithResearcher } from '../../../utils/helper_model.js';

import getPaperId from '../../../utils/getPaperId';

export async function POST(request){

  const { query } = await request.json();
  const paperId= await getPaperId(query);

try {
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  const  recommendationResponse = await axios({
      method: 'GET',
      url: `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${paperId}`,
      params: {
        fields: 'title,authors.name,url,year,abstract',
        limit: 10
      },
      headers: { 'x-api-key': apiKey }
    })


    const recommendations = recommendationResponse.data.recommendedPapers;

    // Save search results to context
    const searchResultData = {
      query: query,
      results: recommendations,
      paperId: paperId,
      searchType: 'semantic_scholar_recommendations'
    };

    await addSearchResult(searchResultData);

    // Generate AI summary of the search results
    let aiSummary = '';
    try {
      const resultsText = recommendations.slice(0, 5).map((paper, index) =>
        `${index + 1}. ${paper.title} by ${paper.authors?.map(a => a.name).join(', ') || 'Unknown'} (${paper.year || 'N/A'})`
      ).join('\n');

      const summaryPrompt = `Based on this search query: "${query}", here are the top recommended research papers:\n\n${resultsText}\n\nPlease provide a brief 2-3 sentence summary of what these papers collectively cover and their relevance to the search query. Keep it concise.`;

      aiSummary = await chatWithResearcher(summaryPrompt, 'system_search_summary');
    } catch (summaryError) {
      console.error('Failed to generate AI summary:', summaryError);
      aiSummary = `Found ${recommendations.length} research papers related to "${query}". Summary generation encountered an issue, but the recommendations are available below.`;
    }

    return NextResponse.json({
      recommendations,
      summary: aiSummary,
      searchId: searchResultData.id
    }, { status: 200 });

}   catch (error) {
        console.error("--- SEARCH API FAILED ---", error);

        // Check if it's a rate limit error (429)
        if (error.response?.status === 429) {
          return NextResponse.json(
              {
                error: 'Rate limit exceeded. Please try again later.',
                recommendations: [],
                summary: 'Unable to fetch recommendations due to API rate limiting. Please try again in a few minutes.'
              },
              { status: 429 }
          );
        }

        return NextResponse.json(
            {
              error: 'Failed to fetch recommendations',
              recommendations: [],
              summary: 'Search failed. Please try again.'
            },
            { status: 500 }
        );
    }
}