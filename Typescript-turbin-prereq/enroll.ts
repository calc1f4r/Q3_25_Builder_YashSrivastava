import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Connection, clusterApiUrl, Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import wallet from "./wallet.json";
import { idl } from "./programs/idl";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
const programId = new PublicKey("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM");

// Create a devnet connection
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// For development/testing, create a dummy wallet
// In production, you'd use a real wallet like Phantom, Solflare, etc.
const califerWallet = Keypair.fromSecretKey(new Uint8Array(wallet));

// Set up the provider for devnet
const provider = new anchor.AnchorProvider(
  connection,
  new anchor.Wallet(califerWallet),
)
anchor.setProvider(provider);

const account_seeds = [
    Buffer.from("prereqs"),
    califerWallet.publicKey.toBuffer(),
];

const program = new Program(idl, provider);

const [account_key, _account_bump] = PublicKey.findProgramAddressSync(account_seeds, program.programId);

console.log("account_key", account_key.toBase58());

const mintCollection = new PublicKey("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");
const mintTs = Keypair.generate();

const MPL_CORE_PROGRAM_ID = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");

// Calculate the authority PDA for the collection
const authority_seeds = [
    Buffer.from("collection"),
    mintCollection.toBuffer(),
];

const [authority_key, _authority_bump] = PublicKey.findProgramAddressSync(authority_seeds, program.programId);

(async () => {
    try {
        // Initialize the account (only once)
        const signature = await program.methods.initialize("calc1f4r")
            .accountsPartial({
                user: califerWallet.publicKey,
                account: account_key,
                system_program: SYSTEM_PROGRAM_ID,
            })  
            .signers([califerWallet])
            .rpc();

        console.log("Initialize tx sent successfully");
        console.log(`Success! Check out your TX here:
https://explorer.solana.com/tx/${signature}?cluster=devnet`);

        // Submit TS with all required accounts including authority
        const txhash = await program.methods
            .submitTs()
            .accountsPartial({
                user: califerWallet.publicKey,
                account: account_key,
                mint: mintTs.publicKey,
                collection: mintCollection,
                authority: authority_key,
                mpl_core_program: MPL_CORE_PROGRAM_ID,
                system_program: SYSTEM_PROGRAM_ID,
            })
            .signers([califerWallet, mintTs])
            .rpc();
        
        console.log(`Submit TS Success! Check out your TX here:
https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`);
    } 
})();