import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const fetchNewsArticles = async (skip = 0, limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/news/?skip=${skip}&limit=${limit}`);
    return {
      articles: response.data.items,
      total: response.data.total,
      page: response.data.page,
      pages: response.data.pages
    };
  } catch (error) {
    console.error('Error fetching news articles:', error);
    throw error;
  }
};

export const fetchNewsArticle = async (articleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/news/${articleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news article:', error);
    throw error;
  }
};

export const submitNewsArticle = async (url, dag_address) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/news/submit`, { 
      url,
      dag_address
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting news article:', error);
    throw error;
  }
};

export const mintNFT = async (articleId, dag_address) => {
  try {
    console.log(`Minting NFT for article ${articleId} with address ${dag_address}`);
    const response = await axios.post(`${API_BASE_URL}/news/${articleId}/mint`, { dag_address });
    console.log('Minting response:', response.data);
    if (response.data && response.data.nft_token_id) {
      return response.data;
    } else {
      throw new Error('Minting failed: Invalid response from server');
    }
  } catch (error) {
    console.error('Error minting NFT:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      if (error.response.data && error.response.data.detail) {
        throw new Error(`Minting failed: ${error.response.data.detail}`);
      }
    } else if (error.request) {
      console.error('Error request:', error.request);
      throw new Error('Minting failed: No response received from server');
    } else {
      console.error('Error message:', error.message);
      throw new Error(`Minting failed: ${error.message}`);
    }
    throw new Error('Failed to mint NFT. Please try again.');
  }
};

export const fetchUserNewsNFTs = async (dag_address, skip = 0, limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/news/constellation/${dag_address}?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    return [];
  }
};

export const getMetagraphInfo = async () => {
  try {
    const response = await axios.get(process.env.REACT_APP_METAGRAPH_API_URL || 'http://localhost:9400/node/info');
    return response.data;
  } catch (error) {
    console.error('Error fetching metagraph info:', error);
    throw error;
  }
};

export const fetchAllNews = async (skip = 0, limit = 100) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/news/all?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all news:', error);
    throw error;
  }
};