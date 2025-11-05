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
        }, {
            timeout: 30000 // 30 second timeout
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

        // Handle different error types
        if (error.response?.status === 429) {
            return new NextResponse(JSON.stringify({
                error: 'Rate limit exceeded. Please try again later.',
                recommendations: []
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new NextResponse(JSON.stringify({
            error: 'Failed to refine query and fetch recommendations',
            recommendations: []
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}