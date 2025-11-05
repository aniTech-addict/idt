'use client'

import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import ActiveUser  from "@/components/ActiveUser";
const HomePage = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ name: "Test User1", email: "john@example.com", role: "Researcher" });

  const { register, handleSubmit, formState: { errors } } = useForm();
  async function onSubmit(data) {
    setLoading(true);
    setError(null);
    setResults(null);


    // Get Paper id for recommendations req
    try {
      const response = await axios.post('/api/search', { query: data.query });
      setResults(response.data);
      console.log("YAKHOO ",response.data)

    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 relative">

      {/* ActiveUser positioned in top right corner */}
      <div className="absolute top-4 right-4 z-10">
        <ActiveUser user={user} onUpdateUser={setUser} />
      </div>
      
      {/* Search Section - Centered at top */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Papers Reference 
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter your search query..."
                  {...register("query", { required: true })}
                  className=" text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {errors.query && (
                  <p className="text-red-500 text-sm mt-1">This field is required</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 whitespace-nowrap"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {error && (
            <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {results && (
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
        )}
      </div>
    </div>
  )
}

export default HomePage