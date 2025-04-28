const express = require("express");
const cors = require("cors");
const { Alchemy, Network } = require("alchemy-sdk");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const alchemy = new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET
});

app.post("/transactions", async (req, res) => {
    const { address, startBlock } = req.body;
    if (!address || !startBlock) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const latestBlock = await alchemy.core.getBlockNumber();
    const txs = [];

    for (let i = startBlock; i <= latestBlock; i++) {
        const { transactions } = await alchemy.core.getBlockWithTransactions(i);
        for (const tx of transactions) {
            const from = tx.from?.toLowerCase();
            const to = tx.to?.toLowerCase();

            if (from === address.toLowerCase() || to === address.toLowerCase()) {
                txs.push({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: Number(tx.value) / 1e18,
                    blockNumber: tx.blockNumber
                });
            }
        }
    }

    res.json(txs);
});

app.post("/balance", async (req, res) => {
    const { address, date } = req.body;
    if (!address || !date) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const targetTs = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000);
    let low = 0;
    let high = await alchemy.core.getBlockNumber();
    let block;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        block = await alchemy.core.getBlock(mid);

        if (block.timestamp < targetTs) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    if (!block) {
        return res.status(404).json({ error: "No block found" });
    }

    const bal = await alchemy.core.getBalance(address, block.number);
    res.json({ balance: Number(bal) / 1e18 });
});

app.post("/tokens", async (req, res) => {
    const { address } = req.body;
    if (!address) {
        return res.status(400).json({ error: "Missing address" });
    }

    const { tokenBalances } = await alchemy.core.getTokenBalances(address);
    const nonZero = tokenBalances.filter(t => t.tokenBalance !== "0");

    const tokens = await Promise.all(
        nonZero.map(async t => {
            const { symbol, name, decimals } = await alchemy.core.getTokenMetadata(t.contractAddress);
            return {
                symbol,
                name,
                balance: Number(t.tokenBalance) / 10 ** decimals
            };
        })
    );

    res.json(tokens);
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
