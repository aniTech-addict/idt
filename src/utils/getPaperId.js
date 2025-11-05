import axios from 'axios';

export default async function getPaperId(query) {

    if (!query) {
      return { error: 'Query is required' }, { status: 400 }
    }

    const headers = {};
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
      headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
    }

    try{
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
      return paperId;
    } catch (error) {
      console.log("Error from getPaperId: ", error);
      throw error;
    }
}

