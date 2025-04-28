import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [address, setAddress] = useState('');
  const [startBlock, setStartBlock] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [date, setDate] = useState('');
  const [balance, setBalanceAtDate] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3001/transactions", {
        address,
        startBlock: parseInt(startBlock),
      });
      setTransactions(response.data);
      setError("");
    } catch (error) {
      setError("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    if (!address || !date) {
      setError("Wallet address and date are required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/balance", {
        address,
        date
      });

      console.log(response.data);
      setBalanceAtDate(response.data.balance);
      setError("");
    } catch (err) {
      console.error(err);
      setError("No balance found for the selected date.");
    }
  };

  const fetchTokens = async () => {
    try {
      const response = await axios.post("http://localhost:3001/tokens", { address });
      setTokens(response.data);
      setError("");
    } catch (error) {
      setError("Failed to fetch tokens.");
    }
  };

  return (
    <div>
      <h1>Ethereum Transaction Crawler</h1>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', columnGap: '50px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', marginRight: '40px' }}>
          <input
            type="text"
            placeholder="Wallet address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: '400px', padding: 8 }}
          />
          <br />

          <input
            type="number"
            placeholder="Start block"
            value={startBlock}
            onChange={(e) => setStartBlock(e.target.value)}
            style={{ width: '400px', padding: 8 }}
          />
          <br />

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button onClick={fetchTransactions} style={{ padding: '10px 20px' }}>
              Get transactions
            </button>
            <button onClick={fetchTokens} style={{ padding: '10px 20px' }}>
              Get tokens
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: 8 }}
            />
            <button onClick={fetchBalance} style={{ padding: '10px 20px' }}>
              Get Balance at Date
            </button>
          </div>

          {balance !== null && (
            <div style={{ marginTop: '10px', textAlign: 'center', width: '100%' }}>
              <p><strong>Balance at {date}:</strong> {balance} ETH</p>
            </div>
          )}
        </div>
      </div>

      <br /><br />
      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        transactions.length > 0 && (
          <table border="1" cellPadding="8" style={{ fontSize: '14px' }}>
            <thead>
              <tr>
                <th>Hash</th>
                <th>From</th>
                <th>To</th>
                <th>Value (ETH)</th>
                <th>Block Number</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.hash}>
                  <td>{tx.hash}</td>
                  <td>{tx.from}</td>
                  <td>{tx.to}</td>
                  <td>{tx.value}</td>
                  <td>{tx.blockNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {tokens.length > 0 && (
        <>

          <table border="1" cellPadding="8">
            <caption style={{ marginTop: '30px', marginBottom: '10px', fontSize: '30px' }}><strong>Tokens</strong></caption>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, index) => (
                <tr key={index}>
                  <td>{token.symbol}</td>
                  <td>{token.name}</td>
                  <td>{token.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;
