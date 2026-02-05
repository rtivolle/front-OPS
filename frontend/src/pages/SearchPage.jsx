import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; // or a specific CSS module if preferred

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            // Updated to use the proxy path
            const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
            setResults(response.data.results || []);
        } catch (error) {
            console.error("Search failed:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-container">
            <div className="header">
                <h1>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                    Doc-Worker
                </h1>
            </div>

            <form onSubmit={handleSearch} className="search-box">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search invoices, contracts, specs..."
                    autoFocus
                />
                <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
                    {loading ? <div className="spinner"></div> : <span>Search</span>}
                </button>
            </form>

            <div className="results">
                {searched && (
                    <>
                        {results.length > 0 ? (
                            <>
                                <div className="results-header">Found {results.length} result(s) for "{query}"</div>
                                {results.map((result, index) => (
                                    <div key={index} className="result-card">
                                        <div className="icon">PDF</div>
                                        <div className="content">
                                            <div className="title-row">
                                                <a href={result.nextcloud_link} target="_blank" rel="noopener noreferrer" className="title">{result.file_name}</a>
                                                <span className="badge">OCR Indexed</span>
                                            </div>
                                            <div className="score">Relevance: {(result.score * 100).toFixed(2)}%</div>
                                            {/* Using dangerouslySetInnerHTML for the excerpt since it contains highlighting tags */}
                                            <div className="excerpt" dangerouslySetInnerHTML={{ __html: result.excerpt }}></div>
                                            <div className="actions">
                                                <a href={result.nextcloud_link} target="_blank" rel="noopener noreferrer" className="open-btn">Open in Nextcloud &rarr;</a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="no-results">
                                <p>No documents found matching "<strong>{query}</strong>"</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try different keywords or check spelling.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                /* Specific styles for SearchPage */
                .search-container {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem 1rem;
                    text-align: left;
                }
                .search-container .header { text-align: center; margin-bottom: 2.5rem; }
                .search-container .header h1 { font-size: 1.8rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: #1f2937; }
                
                .search-box {
                    background: #fff;
                    padding: 0.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    display: flex;
                    gap: 0.5rem;
                    border: 1px solid #e5e7eb;
                    margin-bottom: 2rem;
                }
                .search-box input { flex: 1; border: none; padding: 0.75rem 1rem; font-size: 1rem; outline: none; border-radius: 8px; }
                .search-box button { background-color: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; min-width: 100px; display: flex; justify-content: center; align-items: center; }
                .search-box button:hover { background-color: #1d4ed8; }
                .search-box button:disabled { background-color: #9ca3af; cursor: not-allowed; }

                .result-card {
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 1.25rem;
                    margin-bottom: 1rem;
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                    transition: transform 0.1s;
                }
                .result-card:hover { transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                
                .icon { width: 40px; height: 40px; background: #fee2e2; color: #dc2626; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; }
                .content { flex: 1; min-width: 0; }
                .title-row { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
                .title { font-size: 1.1rem; font-weight: 600; color: #1f2937; text-decoration: none; }
                .title:hover { color: #2563eb; text-decoration: underline; }
                .badge { font-size: 0.7rem; padding: 0.2rem 0.5rem; background: #dcfce7; color: #166534; border-radius: 9999px; }
                .excerpt { font-size: 0.95rem; color: #374151; background: #f9fafb; padding: 0.75rem; border-radius: 6px; border-left: 3px solid #e5e7eb; margin: 0.5rem 0; font-style: italic; }
                .actions { display: flex; justify-content: flex-end; }
                .open-btn { color: #2563eb; text-decoration: none; font-weight: 500; font-size: 0.85rem; }
                
                .spinner { width: 20px; height: 20px; border: 2px solid #ffffff; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                mark { background-color: #fef08a; padding: 0 2px; }
            `}</style>
        </div>
    );
};

export default SearchPage;
