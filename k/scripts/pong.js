import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';
import { KLEROS_ABI } from '../constants/abi.js';
import createLineReader from "../utils/read-line.js";

dotenv.config();

const RPC_URL = process.env.RPC_URL || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contractAddress = "0xA7F42ff7433cB268dD7D59be62b00c30dEd28d3D";
const contractABI = KLEROS_ABI;
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

function getLastProcessedBlock() {
    if (fs.existsSync("store/last-block.txt")) {
        return parseInt(fs.readFileSync("store/last-block.txt", 'utf8'), 10);
    }
    return NaN;
}

function saveLastProcessedBlock(blockNumber) {
    fs.writeFileSync("store/last-block.txt", blockNumber.toString());
}

async function checkIfProcessed(blockNumber, lineReader) {
    while (blockNumber > parseInt(lineReader.readNextLine(), 10)) {
        await lineReader.moveToNextLine();
    }
    const line = await lineReader.readNextLine();
    return line && parseInt(line, 10) === blockNumber;
}

async function fetchMissedPings() {
    const blocksFilePath = 'store/temp-blocks.txt';
    const lineReader = createLineReader(blocksFilePath);
    let fromBlock = 1 + getLastProcessedBlock();
    const latestBlock = await provider.getBlockNumber();

    if (isNaN(fromBlock)) {
        return;
    }

    console.log(`Fetching past Ping events from block ${fromBlock} to ${latestBlock}...`);

    const pastEvents = await contract.queryFilter("Ping", fromBlock, latestBlock);

    console.log(`Found ${pastEvents.length} Ping events.`);

    for (const event of pastEvents) {
        const eventHash = event.transactionHash;
        const blockNumber = event.blockNumber;

        if (!(await checkIfProcessed(blockNumber, lineReader))) {
            console.log(`Missed Ping at block ${event.blockNumber}, calling pong...`);
            try {
                await callPong(eventHash, event.blockNumber);
                fs.writeFileSync('store/last-block.txt', event.blockNumber.toString());
                fs.appendFileSync('store/transactions.txt', `${eventHash}\n`);
                fs.appendFileSync('store/all-blocks.txt', `${event.blockNumber.toString()}\n`);
                lineReader.moveToNextLine();
            } catch (error) {
                console.error("Error processing Ping event:", error);
                console.error("STOPPED AT", eventHash);
                return;
            }
        } else {
            console.log(`Ping at block ${event.blockNumber} already processed.`);
        }
    }
}

async function callPong(eventHash, blockNumber) {
    console.log("Calling pong...", eventHash, blockNumber);
    const tx = await contract.pong(eventHash);
    console.log("Pong transaction sent:", tx.hash);
    await tx.wait();
    console.log("Pong transaction confirmed.");
}

async function listenForPing() {
    contract.on("Ping", async (event) => {
        const eventHash = event.transactionHash;

        const receipt = await provider.getTransactionReceipt(eventHash);
        const blockNumber = receipt.blockNumber;

        try {
            console.log("Transaction Event Hash:", eventHash);
            console.log("Transaction Block Number:", blockNumber);
            await callPong(eventHash, blockNumber);
            fs.appendFileSync('store/transactions.txt', `${eventHash}\n`);
            fs.appendFileSync('store/temp-blocks.txt', `${blockNumber}\n`);
        } catch (error) {
            console.error("Error processing Ping event:", error);
        }
    });
}

async function main() {
    (async () => {
        await fetchMissedPings();
        setInterval(async () => {
            await fetchMissedPings();
        }, 1000 * 60 * 60);
    })();
    listenForPing();
}

main();
