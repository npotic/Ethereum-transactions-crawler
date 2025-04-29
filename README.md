# Ethereum Transaction Crawler API

This is a Node.js backend API built with Express that uses the Alchemy SDK to retrieve Ethereum transaction data, token balances, and historical ETH balances for a given wallet address. It also includes a simple React frontend to interact with the API.

## Technologies
- Node.js
- Express
- React
- Alchemy SDK
- Axios

## Installation  
`npm install`
  
To start the backend server:  
`node index.js`  

To start the frontend:  
`npm run dev`  
or  
`npm start`  
  
## API Endpoints

### POST /transactions
Fetches all ETH transactions for a given wallet address starting from a specified block number to the most recent block.  
  
### POST /balance
Fetches the ETH balance of a wallet address at a specific date using binary search on block timestamps.  
  
### POST /tokens
Fetches all non-zero ERC-20 token balances for the provided wallet address, including metadata such as token name and symbol.  


## Notes
- Requires an Alchemy API key, stored in the .env file as ALCHEMY_API_KEY.
- All data is fetched in real-time from the Ethereum mainnet.
- Binary search is used to efficiently determine the block closest to a given date.
- The frontend provides input fields for a wallet address, block number, and date, and displays transactions, tokens, and ETH balance at a historical point in time.

