import React, { useState, useEffect } from 'react';
import { Home, FileText, Wallet, Calendar, Link2, Tag, ChevronLeft, ChevronRight, Info, Hash } from 'lucide-react';
import { fetchNewsArticles, fetchUserNewsNFTs, mintNFT, getMetagraphInfo } from './api';
import { useDAG4 } from './useDAG4';

const Button = ({ onClick, children, className, outline, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded transition-colors ${
      outline
        ? 'border border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
        : 'bg-red-600 text-white hover:bg-red-700'
    } ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

const Card = ({ children, className }) => (
  <div className={`bg-gray-900 rounded-lg shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const NewsArticleCard = ({ article, onMint, isMinting }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Card className="w-full mb-6">
      <div className="p-4">
        {article._id && (
          <div className="flex flex-col text-gray-400 text-xs mb-2">
            <div className="flex items-center">
              <Hash size={12} className="mr-1" />
              <span>{article._id}</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="font-semibold mr-1">Submitted by:</span>
              <span>{article.dag_address || 'DAG79656574756D20696E7472616E61206D6574616772617068'}</span>
            </div>
          </div>
        )}
        <h3 className="text-xl font-semibold mb-2 text-white">{article.title}</h3>
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <Calendar className="mr-2" size={16} />
          <span>{formatDate(article.published_date)}</span>
        </div>
        <p className="text-gray-300 mb-4">{article.summary || article.content.substring(0, 150) + '...'}</p>
        {article.top_image && (
          <img src={article.top_image} alt={article.title} className="w-full h-48 object-cover rounded-md mb-4" />
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {article.keywords && article.keywords.map((keyword, index) => (
            <span key={index} className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs flex items-center">
              <Tag size={12} className="mr-1" />
              {keyword}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">By {article.authors}</span>
          <div>
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 flex items-center mr-4">
              <Link2 size={16} className="mr-1" />
              Read More
            </a>
            <Button onClick={() => onMint(article._id)} disabled={isMinting || article.minted_by}>
              {isMinting ? 'Minting...' : article.minted_by ? 'Already Minted' : 'Mint NFT'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full bg-gray-800 text-white disabled:opacity-50"
      >
        <ChevronLeft size={20} />
      </button>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`w-8 h-8 rounded-full ${
            currentPage === index + 1 ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
          }`}
        >
          {index + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full bg-gray-800 text-white disabled:opacity-50"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

const LatestNews = ({ newsArticles, isLoading, error, currentPage, totalPages, onPageChange, onMint, isMinting }) => {
  if (isLoading) return <p>Loading news articles...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!Array.isArray(newsArticles) || newsArticles.length === 0) return <p>No news articles available.</p>;

  return (
    <>
      <div className="space-y-6">
        {newsArticles.map((article) => (
          <NewsArticleCard key={article._id} article={article} onMint={onMint} isMinting={isMinting} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

const App = () => {
  const { isConnected, address, connect, disconnect } = useDAG4();
  const [currentPage, setCurrentPage] = useState('home');
  const [newsPage, setNewsPage] = useState(1);
  const [newsArticles, setNewsArticles] = useState([]);
  const [userNFTs, setUserNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalNewsArticles, setTotalNewsArticles] = useState(0);
  const [metagraphInfo, setMetagraphInfo] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingError, setMintingError] = useState(null);

  const itemsPerPage = 9;

  useEffect(() => {
    loadNewsArticles();
  }, [newsPage]);

  useEffect(() => {
    if (isConnected) {
      loadUserNFTs();
    }
  }, [isConnected, address]);

  const loadNewsArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = (newsPage - 1) * itemsPerPage;
      const result = await fetchNewsArticles(skip, itemsPerPage);
      setNewsArticles(result.articles);
      setTotalNewsArticles(result.total);
    } catch (err) {
      setError('Failed to load news articles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserNFTs = async () => {
    try {
      const nfts = await fetchUserNewsNFTs(address);
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Error loading user NFTs:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
      setUserNFTs([]);
      setCurrentPage('home');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      alert('Failed to disconnect wallet. Please try again.');
    }
  };

  const handleMintNFT = async (articleId) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setIsMinting(true);
    setMintingError(null);
    console.log('Minting NFT for article:', articleId);
    console.log('Using address:', address);
    try {
      const result = await mintNFT(articleId, address);
      console.log('Minting result:', result);
      alert(`NFT minted successfully! Token ID: ${result.nft_token_id}`);
      await loadNewsArticles(); // Refresh news articles to update minting status
      await loadUserNFTs(); // Refresh user's NFTs
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      setMintingError(error.message);
    } finally {
      setIsMinting(false);
    }
  };

  const loadMetagraphInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const info = await getMetagraphInfo();
      setMetagraphInfo(info);
    } catch (error) {
      setError('Failed to load metagraph information');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage === 'info') {
      loadMetagraphInfo();
    }
  }, [currentPage]);

  const totalNewsPages = Math.ceil(totalNewsArticles / itemsPerPage);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gray-900 shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <button onClick={() => setCurrentPage('home')} className="flex items-center text-xl font-bold text-red-600 hover:text-red-500">
              <Home className="mr-2" /> Illicit Edge
            </button>
            <button onClick={() => setCurrentPage('myNews')} className="flex items-center text-white hover:text-red-500">
              <FileText className="mr-2" /> My News
            </button>
            <button onClick={() => setCurrentPage('info')} className="flex items-center text-white hover:text-red-500">
              <Info className="mr-2" /> Metagraph Info
            </button>
          </div>
          {isConnected ? (
            <div className="flex items-center">
              <span className="mr-2 text-gray-400">{address}</span>
              <Button onClick={handleDisconnectWallet} outline>Disconnect</Button>
            </div>
          ) : (
            <Button onClick={handleConnectWallet}>
              <Wallet className="mr-2" /> Connect Wallet
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4">
        {currentPage === 'home' && (
          <>
            <h2 className="text-3xl font-semibold mb-8 text-red-600">Latest News Articles</h2>
            <LatestNews
              newsArticles={newsArticles}
              isLoading={isLoading}
              error={error}
              currentPage={newsPage}
              totalPages={totalNewsPages}
              onPageChange={setNewsPage}
              onMint={handleMintNFT}
              isMinting={isMinting}
            />
            {mintingError && <p className="text-red-500 mt-4">{mintingError}</p>}
          </>
        )}

        {currentPage === 'myNews' && (
          <div>
            <h2 className="text-3xl font-semibold mb-8 text-red-600">My News NFTs</h2>
            {isConnected ? (
              userNFTs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userNFTs.map((nft) => (
                    <Card key={nft._id} className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{nft.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">{nft.summary}</p>
                      {nft.top_image && (
                        <img src={nft.top_image} alt={nft.title} className="w-full h-32 object-cover rounded-md mb-2" />
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{new Date(nft.published_date).toLocaleDateString()}</span>
                        <a href={nft.url} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 text-sm">
                          Read More
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>You don't have any News NFTs yet. Mint some from the home page!</p>
              )
            ) : (
              <div className="text-center">
                <p className="text-xl mb-4">Connect your wallet to view your minted News NFTs</p>
                <Button onClick={handleConnectWallet}>
                  <Wallet className="mr-2" /> Connect Wallet
                </Button>
              </div>
            )}
          </div>
        )}

        {currentPage === 'info' && (
          <div>
            <h2 className="text-3xl font-semibold mb-8 text-red-600">Metagraph Information</h2>
            {isLoading ? (
              <p>Loading metagraph information...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : metagraphInfo ? (
              <pre className="bg-gray-900 p-4 rounded-lg overflow-auto">
                {JSON.stringify(metagraphInfo, null, 2)}
              </pre>
            ) : (
              <p>No metagraph information available.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;