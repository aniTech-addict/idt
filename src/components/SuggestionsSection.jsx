import React, { useState } from 'react';

const SuggestionsSection = ({ enhanceQuery, onRefineQuery }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  console.log("SuggestionsSection received:", enhanceQuery);
  if (!enhanceQuery || !enhanceQuery.message) {
    console.log("SuggestionsSection: no enhanceQuery or no message");
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onRefineQuery) {
      onRefineQuery(selectedOption, additionalContext);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Query Enhancement Needed</h3>
      <p className="text-yellow-700 mb-4">{enhanceQuery.message}</p>
      {enhanceQuery.options && enhanceQuery.options.length > 0 && (
        <div className="mb-4">
          <p className="text-yellow-800 font-medium mb-2">Suggested refinements:</p>
          <ul className="list-disc list-inside text-yellow-700 space-y-1">
            {enhanceQuery.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="optionNumber" className="block text-sm font-medium text-yellow-800 mb-1">
            Option Number (optional)
          </label>
          <input
            type="text"
            id="optionNumber"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            placeholder="Enter option number (e.g., 1, 2, 3)"
            className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black"
          />
        </div>

        <div>
          <label htmlFor="additionalContext" className="block text-sm font-medium text-yellow-800 mb-1">
            Additional Context
          </label>
          <textarea
            id="additionalContext"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Provide any additional context or specify your own refinement..."
            rows={3}
            className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          Refine Query
        </button>
      </form>
    </div>
  );
};

export default SuggestionsSection;