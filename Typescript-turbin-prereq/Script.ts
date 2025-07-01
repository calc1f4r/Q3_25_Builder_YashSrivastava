import bs58 from 'bs58';
import * as fs from 'fs';
import prompt = require('prompt-sync');

const promptSync = prompt();

// Function to convert base58 private key to wallet JSON array
function base58ToWallet(base58Key: string): number[] {
    try {
        const wallet = bs58.decode(base58Key);
        return Array.from(wallet);
    } catch (error) {
        throw new Error(`Invalid base58 key: ${error}`);
    }
}

// Function to convert wallet JSON array to base58 private key
function walletToBase58(walletArray: number[]): string {
    try {
        const uint8Array = new Uint8Array(walletArray);
        return bs58.encode(uint8Array);
    } catch (error) {
        throw new Error(`Invalid wallet array: ${error}`);
    }
}

// Function to save wallet array to JSON file
function saveWalletToFile(walletArray: number[], filename: string): void {
    try {
        fs.writeFileSync(filename, JSON.stringify(walletArray));
        console.log(`✅ Wallet saved to ${filename}`);
    } catch (error) {
        console.error(`❌ Error saving wallet: ${error}`);
    }
}

// Function to load wallet array from JSON file
function loadWalletFromFile(filename: string): number[] {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Error loading wallet from ${filename}: ${error}`);
    }
}

// Main conversion logic
(async () => {
    const choice = promptSync("Choose option (1, 2, or 3): ");
    
    try {
        switch (choice) {
            case '1':
                // Base58 to wallet JSON
                const base58Key = promptSync("Enter your base58 private key: ");
                const walletArray = base58ToWallet(base58Key);
                const filename = promptSync("Enter filename (e.g., Turbin3-wallet.json): ") || "wallet.json";
                
                console.log(`\nWallet array: [${walletArray.join(',')}]`);
                saveWalletToFile(walletArray, filename);
                break;
                
            case '2':
                // Wallet JSON to base58
                const inputFile = promptSync("Enter wallet JSON filename: ");
                const loadedWallet = loadWalletFromFile(inputFile);
                const base58Result = walletToBase58(loadedWallet);
                
                console.log(`\n📋 Base58 private key: ${base58Result}`);
                
                const saveBase58 = promptSync("Save to file? (y/n): ");
                if (saveBase58.toLowerCase() === 'y') {
                    const base58Filename = promptSync("Enter filename (e.g., private-key.txt): ") || "private-key.txt";
                    fs.writeFileSync(base58Filename, base58Result);
                    console.log(`✅ Base58 key saved to ${base58Filename}`);
                }
                break;
                
            case '3':
                // Convert existing file
                const sourceFile = promptSync("Enter source wallet filename: ");
                const targetFormat = promptSync("Convert to (base58/json): ");
                
                if (targetFormat.toLowerCase() === 'base58') {
                    const wallet = loadWalletFromFile(sourceFile);
                    const base58 = walletToBase58(wallet);
                    console.log(`\n📋 Base58: ${base58}`);
                    
                    const outputFile = promptSync("Save to filename: ") || "converted-key.txt";
                    fs.writeFileSync(outputFile, base58);
                    console.log(`✅ Converted to ${outputFile}`);
                } else if (targetFormat.toLowerCase() === 'json') {
                    console.log("❌ This option expects source to be base58. Use option 1 instead.");
                } else {
                    console.log("❌ Invalid target format. Use 'base58' or 'json'");
                }
                break;
                
            default:
                console.log("❌ Invalid choice");
        }
    } catch (error) {
        console.error(`❌ Error: ${error}`);
    }
})();