import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaProfile } from "../target/types/solana_profile";
import * as ecies from "ecies-25519";
import * as encUtils from 'enc-utils';

class SocialProfiles {
  twitter?: string;
  github?: string;
  discord?: string;
  telegram?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  snapchat?: string;
  tiktok?: string;
  youtube?: string;
  medium?: string;
  twitch?: string;
  reddit?: string;
  threads?: string;

  encrypt(encryptionKey: anchor.web3.Keypair) {

  }
}

describe("solana-profile", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaProfile as Program<SolanaProfile>;

  it("Is initialized!", async () => {
    // const encryptionKey = anchor.web3.Keypair.generate();
    const encryptionKey = ecies.generateKeyPair();
    const payer = anchor.web3.Keypair.generate();
    let airdrop = await anchor.getProvider().connection.requestAirdrop(payer.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop, "finalized");

    const profile = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), encryptionKey.publicKey, payer.publicKey.toBuffer()],
      program.programId)[0];

    console.log("pubkey: ", encryptionKey.publicKey);
    console.log("privkey: ", encryptionKey.privateKey);

    const str = "Hello, world!";
    const msg = encUtils.utf8ToArray(str);
    const encryptedData = await ecies.encrypt(msg, encryptionKey.publicKey);
    console.log(encryptedData);

    const tx0 = await program.methods
      .writeAccount(new anchor.web3.PublicKey(encryptionKey.publicKey), Buffer.from(encryptedData))
      .accounts({ profile, owner: payer.publicKey })
      .signers([payer])
      .rpc();
    console.log("Your transaction signature", tx0);
    const account0 = await program.account.profile.fetch(profile);
    console.log(account0);
    const decryptedData = await ecies.decrypt(account0.data, encryptionKey.privateKey);
    console.log(encUtils.arrayToUtf8(decryptedData));
  });
});
