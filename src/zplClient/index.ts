import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  LiquidityManagementClient,
  TwoWayPegClient,
} from "@zeus-network/zpl-sdk";

export class ZplClient {
  public twoWayPegProgramId: PublicKey;
  public liquidityManagementProgramId: PublicKey;
  public assetMint: PublicKey;
  public twoWayPeg: TwoWayPegClient;
  public liquidityManagement: LiquidityManagementClient;

  constructor(
    private connection: Connection,
    private walletPublicKey: PublicKey | null,
    private signTransaction:
      | (<T extends Transaction | VersionedTransaction>(
          transaction: T
        ) => Promise<T>)
      | undefined,
    twoWayPegProgramId: string,
    liquidityManagementProgramId: string,
    assetMint: string
  ) {
    this.twoWayPegProgramId = new PublicKey(twoWayPegProgramId);
    this.liquidityManagementProgramId = new PublicKey(
      liquidityManagementProgramId
    );
    this.assetMint = new PublicKey(assetMint);

    this.twoWayPeg = new TwoWayPegClient(connection, this.twoWayPegProgramId);

    this.liquidityManagement = new LiquidityManagementClient(
      connection,
      this.liquidityManagementProgramId
    );
  }

  async signAndSendTransactionWithInstructions(
    ixs: TransactionInstruction[],
    lookupTableAccounts?: AddressLookupTableAccount[]
  ) {
    const solanaPubkey = this.walletPublicKey;
    const { signTransaction } = this;

    if (!solanaPubkey || !signTransaction)
      throw new Error("Wallet is not connected");

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();

    const msg = new TransactionMessage({
      payerKey: solanaPubkey,
      recentBlockhash: blockhash,
      instructions: ixs,
    }).compileToV0Message(lookupTableAccounts);

    const tx = new VersionedTransaction(msg);

    const signedTx = await signTransaction(tx);

    const signature = await this.connection.sendRawTransaction(
      signedTx.serialize(),
      {
        preflightCommitment: "confirmed",
      }
    );

    await this.connection.confirmTransaction(
      {
        signature,
        lastValidBlockHeight,
        blockhash,
      },
      "confirmed"
    );

    return signature;
  }
}
