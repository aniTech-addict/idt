import { NextResponse } from 'next/server';
import axios from 'axios';
import  gen_ai  from '../../../utils/gemini.util';
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
        fields: 'title,authors.name,url,year',
        limit: 10
      },
      headers: { 'x-api-key': apiKey }
    })

    
    const recommendations = recommendationResponse.data.recommendedPapers;
    const genRes =await gen_ai(query);

  console.log("--- RECOMMENDATIONS FOUND ---", recommendations);
  return new NextResponse(JSON.stringify(recommendations), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

}   catch (error) {
        console.error("--- ONE OF THE FETCHES FAILED ---", error);
        return NextResponse.json(
            { error: 'Failed to fetch recommendations' },
            { status: 500 }
        );
    }
}