import axios from "axios";
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        console.log("Reached router")
        const { query } = await request.json();
        console.log("requested query = ",query);

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const headers = {};
        if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
            headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
        }

        const response = await axios({
            method: "GET",
            url: "https://api.semanticscholar.org/graph/v1/paper/search",
            params: {
                query: query,
                limit: 5,
                fields: 'title,authors.name'
            },
            headers
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error in suggestions API:', error.response?.data || error.message);

        if (error.response?.status === 429) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please wait a moment and try again, or consider getting an API key for higher limits.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch suggestions from Semantic Scholar' },
            { status: 500 }
        );
    }
}