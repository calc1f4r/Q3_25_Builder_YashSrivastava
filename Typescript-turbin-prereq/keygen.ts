import { Keypair } from "@solana/web3.js";
import * as fs from 'fs';

let kp = Keypair.generate()

console.log(`You've generated a new Solana wallet: ${kp.publicKey.toBase58()}`)
// writing it to a new file
fs.writeFileSync('dev-wallet.json', JSON.stringify([...kp.secretKey]))

console.log(`[${kp.secretKey}]`)


