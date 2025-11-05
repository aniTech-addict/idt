import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const headers = {};
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
      headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
    }

    const response = await axios({
      method: 'GET',
      url: 'https://api.semanticscholar.org/graph/v1/paper/search',
      params: {
        query,
        limit: 1,
        fields: 'title,authors.name'
      },
      headers
    });

    const paperId = response.data.data[0].paperId;
    const recommendations = await getRecommendations(paperId);

    if (!recommendations) {
      return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
    }

    console.log(recommendations.citations);

    return NextResponse.json({
      ...response.data,
      recommendations: recommendations.recommendations,
      citations: recommendations.citations
    });
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);

    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment and try again, or consider getting an API key for higher limits.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch data from Semantic Scholar' },
      { status: 500 }
    );
  }
}

async function getRecommendations(paperId){

try {
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  const  recommendationResponse = await axios({
      method: 'GET',
      url: `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${paperId}`,
      params: {
        fields: 'title,authors.name,url,year',
        limit: 10
      },
      headers: { 'x-api-key': apiKey }
    })

  const recommendations = recommendationResponse.data.recommendedPapers;

  console.log("--- RECOMMENDATIONS FOUND ---", recommendations);
  return recommendations ;

}   catch (error) {
        console.error("--- ONE OF THE FETCHES FAILED ---", error);
    }
}