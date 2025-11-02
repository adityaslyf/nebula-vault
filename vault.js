import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  transfer,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import fs from "fs";

// Load wallet
const secret = JSON.parse(fs.readFileSync(`${process.env.HOME}/.config/solana/devnet.json`));
const wallet = Keypair.fromSecretKey(new Uint8Array(secret));

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// ✅ Replace with your Mint
const MINT_ADDRESS = new PublicKey("Fa3JUK2dokFJZgjDyXa5dSpRhrBb8veoNnpbw9zvqgzr");

// ✅ Vault PDA
const [vaultPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault"), wallet.publicKey.toBuffer()],
  TOKEN_PROGRAM_ID
);

async function main() {
  console.log("🔐 Creating Vault & Locking Tokens...");
  console.log("Wallet:", wallet.publicKey.toBase58());
  console.log("Vault PDA:", vaultPDA.toBase58());

  const walletATA = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    MINT_ADDRESS,
    wallet.publicKey
  );

  const vaultATA = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    MINT_ADDRESS,
    vaultPDA,
    true
  );

  const signature = await transfer(
    connection,
    wallet,
    walletATA.address,
    vaultATA.address,
    wallet.publicKey,
    10 // ✅ Lock 10 tokens in Vault
  );

  console.log("✅ Tokens Locked Successfully!");
  console.log("Tx Signature:", signature);
}

main().catch(console.error);
