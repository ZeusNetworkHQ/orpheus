import ecc from "@bitcoinerlab/secp256k1";
import { PublicKey } from "@solana/web3.js";
import * as bitcoin from "bitcoinjs-lib";
import { sha256, taggedHash } from "bitcoinjs-lib/src/crypto";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import ECPairFactory from "ecpair";

import { BitcoinNetwork } from "@/types/store";
import { BitcoinWallet, BitcoinXOnlyPublicKey } from "@/types/wallet";

import { convertBitcoinNetwork } from ".";

bitcoin.initEccLib(ecc);

export const ECPair = ECPairFactory(ecc);

interface TweakSignerOpts {
  network: bitcoin.networks.Network;
  tapTweak?: TapTweak;
}

type TapTweak = Buffer;

export interface Wallet {
  id: string;
  title: string;
  icon: string;
  type: "connector" | "solana";
  isDetected: boolean;
  url: string;
}

// Ref: https://github.com/Eunovo/taproot-with-bitcoinjs/blob/main/src/index.ts#L236
export function tweakSigner(
  signer: bitcoin.Signer,
  opts: TweakSignerOpts = { network: bitcoin.networks.regtest }
): bitcoin.Signer {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  let privateKey: Uint8Array | undefined = signer.privateKey!;
  if (!privateKey) {
    throw new Error("Private key is required for tweaking signer!");
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey);
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), opts.tapTweak)
  );
  if (!tweakedPrivateKey) {
    throw new Error("Invalid tweaked private key!");
  }
  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  });
}

export function tapTweakHash(pubkey: Buffer, h: Buffer | undefined): Buffer {
  return taggedHash("TapTweak", Buffer.concat(h ? [pubkey, h] : [pubkey]));
}

export const deriveBitcoinWallet = async (
  publicKey: PublicKey,
  bitcoinNetwork: BitcoinNetwork,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<BitcoinWallet | null> => {
  try {
    if (publicKey === undefined) return null;
    const ECPair = ECPairFactory(ecc);
    bitcoin.initEccLib(ecc);
    // `publicKey` will be null if the wallet isn't connected
    if (!publicKey) throw new Error("Wallet not connected!");
    // `signMessage` will be undefined if the wallet doesn't support it
    if (!signMessage)
      throw new Error("Wallet does not support message signing!");
    // Encode anything as bytes
    const message = new TextEncoder().encode(
      `By proceeding, you are authorizing the generation of a Testnet address based on the Solana wallet you've connected. This process does not charge any fees. Connected Solana wallet address:${publicKey.toBase58()}`
    );

    // Sign the bytes using the wallet
    const signature = await signMessage(message);

    // Verify that the bytes were signed using the private key that matches the known public key
    // if (!verify(signature, message, publicKey.toBytes()))
    //   throw new Error("Invalid signature!");
    const signature_hash = sha256(Buffer.from(signature));
    const privkey_hex = signature_hash.toString("hex");

    const keyPair = ECPair.fromPrivateKey(signature_hash);
    const privkey = keyPair;
    const pubkey = keyPair.publicKey.toString("hex");
    const network = convertBitcoinNetwork(bitcoinNetwork);

    const p2pkh =
      bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network,
      }).address ?? "";
    const p2wpkh =
      bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network,
      }).address ?? "";
    const p2tr =
      bitcoin.payments.p2tr({
        internalPubkey: keyPair.publicKey.subarray(1, 33),
        network,
      }).address ?? "";

    const tweakKeypair = tweakSigner(keyPair, {
      network,
    });

    return {
      privkeyHex: privkey_hex,
      privkey,
      pubkey,
      p2pkh,
      p2wpkh,
      p2tr,
      tweakSigner: tweakKeypair,
      signer: keyPair,
    };
  } catch (error) {
    console.log("error", `Sign Message failed! ${error}`);
    return null;
  }
};

export const getBitcoinConnectorWallet = (
  pubkey: string,
  bitcoinNetwork: BitcoinNetwork
): BitcoinWallet => {
  const network = convertBitcoinNetwork(bitcoinNetwork);
  const { address: bitcoinAddress } = bitcoin.payments.p2tr({
    internalPubkey: toXOnly(Buffer.from(pubkey, "hex")),
    network,
  });
  return {
    pubkey: pubkey,
    p2tr: bitcoinAddress ?? "",
  };
};

export function getInternalXOnlyPubkeyFromUserWallet(
  bitcoinWallet: BitcoinWallet | null
): BitcoinXOnlyPublicKey | null {
  if (!bitcoinWallet) {
    return null;
  }

  const internalXOnlyPublicKey = toXOnly(
    Buffer.from(bitcoinWallet.pubkey, "hex")
  );

  return internalXOnlyPublicKey;
}

export const checkWalletAvailability = () => ({
  muses: typeof window !== "undefined" && window.muses !== undefined,
});

export const txConfirm = {
  isNotRemind: () => {
    if (typeof window === "undefined") return false;
    const value = localStorage.getItem("tx-confirm-modal-remind");
    return value === "0";
  },
  setNotRemind: (notRemind: boolean) => {
    if (typeof window === "undefined") return;
    if (notRemind) {
      localStorage.setItem("tx-confirm-modal-remind", "0");
    } else {
      localStorage.removeItem("tx-confirm-modal-remind");
    }
  },
  reset: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("tx-confirm-modal-remind");
  },
};
