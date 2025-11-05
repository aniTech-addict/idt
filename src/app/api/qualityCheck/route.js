import  gen_ai  from '../../../utils/gemini.util';
import { NextResponse } from 'next/server';
export async  function POST(request) {
    const { query } = await request.json();
    const promptType = "SUGGESTION";
    const genRes =await gen_ai(query,promptType);
    if(genRes.clarity == "ambiguous") {
      return new NextResponse(JSON.stringify({queryQuality: genRes.clarity, message: genRes}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
 
  return new NextResponse(JSON.stringify({queryQuality: genRes.clarity,}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}