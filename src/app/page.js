'use client'

import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import ActiveUser  from "@/components/ActiveUser";
import RecommendationsSection from "@/components/RecommendationsSection";
import SuggestionsSection from "@/components/SuggestionsSection";
import ChatInterface from "@/components/ChatInterface";
const HomePage = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ name: "Test User1", email: "john@example.com", role: "Researcher" });
  const [enhanceQuery, setEnhanceQuery] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const handleRefineQuery = async (optionNumber, additionalContext) => {
   // Validate optionNumber to prevent array out of bounds
   if (optionNumber < 0 || optionNumber >= enhanceQuery.length) {
     console.error("Invalid option number:", optionNumber);
     setError("Invalid refinement option selected.");
     return;
   }

   const option = enhanceQuery[optionNumber];
   console.log("Refining query with:", { option, additionalContext });

   setLoading(true);
   setError(null);

   try {
     // The refineQuery API now returns recommendations directly
     const response = await axios.post('/api/refineQuery', {
       option: option,
       context: additionalContext
     });

     // Set the recommendations directly from the response
     setResults(response.data.recommendations);

     // Auto-fill the search box with the refined query
     const refinedQuery = response.data.refined_query;
     setSearchQuery(refinedQuery);
     setValue("query", refinedQuery); // Update react-hook-form value
   } catch (error) {
     console.error("Error from refinement:", error);
     setError(error.response?.data?.error || 'Failed to refine query');
   } finally {
     setLoading(false);
     // Clear enhanceQuery after refinement attempt
     setEnhanceQuery(null);
   }
 };
  async function onSubmit(data) {
    setLoading(true);
    setError(null);
    setResults(null);


    // Get Paper id for recommendations req
    try {
      const QualityResponse = await axios.post('/api/qualityCheck', { query: data.query });
      const response = QualityResponse.data;
      console.log("MAKI",response);
      // Check query quality

      if( response.queryQuality !== "clear" ){
        console.log("Was Ambiguous", response);
        console.log("response.message:", response.message);
        setEnhanceQuery(response.message);

        setResults(null); // Don't show results for ambiguous queries
      } else {
        // Start Recommendations search for Good Query
        try {
          const searchResponse = await axios.post('/api/search', { query: data.query });
          setResults(searchResponse.data.recommendations);
        } catch (error) {
          console.log("Error from search: ", error);
          setError('Failed to fetch recommendations');
        }

        setEnhanceQuery(null);
      }
      console.log("YAKHOO ",response.data)

    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 relative flex">

      {/* Main Content - 3/4 width */}
      <div className="flex-1 flex flex-col">
        {/* ActiveUser positioned in top right corner */}
        <div className="absolute top-4 left-4 z-10">
          <ActiveUser user={user} onUpdateUser={setUser} />
        </div>

        {/* Search Section - Centered at top */}
        <div className="bg-white shadow-lg border-b-4 border-gray-400">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-black text-center mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              Papers Reference
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter your search query..."
                    {...register("query", { required: true })}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-gray-800 w-full px-4 py-3 border-2 border-gray-400 font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  {errors.query && (
                    <p className="text-red-600 text-sm font-bold mt-1">This field is required</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black px-6 py-3 border-2 border-blue-700 transition-colors duration-200 whitespace-nowrap"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {error && (
              <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-50 border-2 border-red-300">
                <p className="text-red-700 font-bold">{error}</p>
              </div>
            )}

            <SuggestionsSection enhanceQuery={enhanceQuery} onRefineQuery={handleRefineQuery} />
          </div>
        </div>

        <RecommendationsSection results={results} />
      </div>

      {/* Chat Interface - 1/4 width */}
      <div className="w-1/4 border-l-4 border-gray-400">
        <ChatInterface userId={user.email} />
      </div>
    </div>
  )
}

export default HomePage