# Illicit Edge - NFT News Platform

This project is a frontend application for the Illicit Edge NFT News Platform. It allows users to view, mint, and manage news NFTs.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Features

- View latest news NFTs
- Connect Stargazer wallet
- Mint news NFTs
- View owned news NFTs

## Technologies Used

- React
- Tailwind CSS
- Lucide React (for icons)

## Connecting to the Metagraph

To connect this frontend to your local metagraph:

1. Update the API base URL in `src/App.js` to point to your local metagraph.
2. Implement the actual Stargazer wallet connection logic.
3. Replace mock data fetching functions with actual API calls to your metagraph.

## License

This project is licensed under the MIT License.
