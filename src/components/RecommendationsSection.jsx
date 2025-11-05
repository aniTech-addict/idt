import React from 'react';

const RecommendationsSection = ({ results }) => {
  if (!results) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Search Results</h2>
        {results && results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((paper, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{paper.title}</h3>
                <p className="text-gray-600">
                  <span className="font-medium">Authors:</span> {paper.authors?.map(author => author.name).join(', ') || 'Unknown'}
                </p>
                {paper.year && (
                  <p className="text-gray-500 text-sm mt-1">Year: {paper.year}</p>
                )}
                {paper.url && (
                  <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                    View Paper →
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">No results found for your query.</p>
        )}
      </div>
    </div>
  );
};

export default RecommendationsSection;