import gen_ai_title from '../../../utils/geminiTitle.util';
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    const { context, option } = await request.json();

    try {
        // Generate a refined paper title using the separate Gemini util
        const refinedTitle = await gen_ai_title(option, context);

        // Use the refined title to search for recommendations
        const searchResponse = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/search`, {
            query: refinedTitle
        });

        const recommendations = searchResponse.data.recommendations;

        return new NextResponse(JSON.stringify({
            refined_query: refinedTitle,
            recommendations: recommendations
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Error in refineQuery:", error);
        return new NextResponse(JSON.stringify({
            error: 'Failed to refine query and fetch recommendations'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}