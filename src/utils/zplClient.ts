import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import BN from "bn.js";
import bs58 from "bs58";
import { sha256 } from "js-sha256";

import { BitcoinAddress, BitcoinXOnlyPublicKey } from "@/types/wallet";
import {
  createHotReserveBucketSchema,
  retrieveSchema,
  storeSchema,
} from "@/types/zplClient";
import {
  addWithdrawalRequestSchema,
  reactivateHotReserveBucketSchema,
  HotReserveBucket,
  hotReserveBucketSchema,
  positionSchema,
  Position,
  TwoWayPegConfiguration,
  twoWayPegConfigurationSchema,
} from "@/types/zplClient";

import { HOT_RESERVE_BUCKET_VALIDITY_PERIOD } from "./constant";

function generateAccountDiscriminator(input: string): Buffer {
  const preImage = Buffer.from(input);
  return Buffer.from(sha256(preImage), "hex").subarray(0, 8);
}

function deserializeHotReserveBucket(
  publicKey: PublicKey,
  data: Buffer | undefined
): HotReserveBucket {
  if (!data) throw new Error("Data is undefined");

  const {
    owner,
    guardianSetting,
    status,
    taprootXOnlyPublicKey,
    tapTweakHash,
    keyPathSpendPublicKey,
    scriptPathSpendPublicKey,
    lockTime,
    createdAt,
    expiredAt,
  } = hotReserveBucketSchema.decode(data);

  return {
    publicKey,
    owner,
    guardianSetting,
    status,
    taprootXOnlyPublicKey,
    tapTweakHash,
    keyPathSpendPublicKey,
    scriptPathSpendPublicKey,
    lockTime,
    createdAt,
    expiredAt,
  };
}

function deserializePosition(
  publicKey: PublicKey,
  data: Buffer | undefined
): Position {
  if (!data) throw new Error("Data is undefined");

  const {
    owner,
    guardianSetting,
    storedAmount,
    frozenAmount,
    createdAt,
    updatedAt,
  } = positionSchema.decode(data);

  return {
    publicKey,
    owner,
    guardianSetting,
    storedAmount,
    frozenAmount,
    createdAt,
    updatedAt,
  };
}

export function deserializeTwoWayPegConfiguration(
  publicKey: PublicKey,
  data: Buffer | undefined
): TwoWayPegConfiguration {
  if (!data) throw new Error("Data is undefined");

  const {
    superOperatorCertificate,
    zeusColdReserveRecoveryPublicKey,
    zeusColdReserveRecoveryLockTime,
    layerFeeCollector,
    chadbufferAuthority,
    cpiIdentity,
    layerCaProgramId,
    bitcoinSpvProgramId,
    liquidityManagementProgramId,
    bucketOpenFeeAmount,
    bucketReactivationFeeAmount,
    withdrawalFeeAmount,
    minerFeeRate,
  } = twoWayPegConfigurationSchema.decode(data);

  return {
    publicKey,
    superOperatorCertificate,
    zeusColdReserveRecoveryPublicKey,
    zeusColdReserveRecoveryLockTime,
    layerFeeCollector,
    chadbufferAuthority,
    cpiIdentity,
    layerCaProgramId,
    bitcoinSpvProgramId,
    liquidityManagementProgramId,
    bucketOpenFeeAmount,
    bucketReactivationFeeAmount,
    withdrawalFeeAmount,
    minerFeeRate,
  };
}

export class ZplClient {
  private twoWayPegProgramId: PublicKey;
  private liquidityManagementProgramId: PublicKey;
  private assetMint: PublicKey;

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
  }

  deriveConfigurationAddress() {
    const [configurationAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("configuration")],
      this.twoWayPegProgramId
    );
    return configurationAddress;
  }

  deriveCpiIdentityAddress() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("cpi-identity")],
      this.twoWayPegProgramId
    )[0];
  }

  deriveHotReserveBucketAddress(
    hotReserveBitcoinXOnlyPublicKey: BitcoinXOnlyPublicKey
  ): PublicKey {
    const bucketPda = PublicKey.findProgramAddressSync(
      [Buffer.from("hot-reserve-bucket"), hotReserveBitcoinXOnlyPublicKey],
      this.twoWayPegProgramId
    )[0];
    return bucketPda;
  }

  deriveInteraction(seed1: Buffer, seed2: BN) {
    const interactionPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("interaction"),
        // Deposit: transaction_id, Withdrawal: receiver_address
        seed1,
        // Deposit: v_out, Withdrawal: slot (u64 trimmed to u32)
        seed2.toArrayLike(Buffer, "le", 4),
      ],
      this.twoWayPegProgramId
    )[0];

    return interactionPda;
  }

  deriveLiquidityManagementConfigurationAddress() {
    const [configurationAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("configuration")],
      this.liquidityManagementProgramId
    );

    return configurationAddress;
  }

  deriveLiquidityManagementGuardianSettingAddress(
    twoWayPegGuardianSetting: PublicKey
  ) {
    const [guardianSettingAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("guardian-setting"), twoWayPegGuardianSetting.toBuffer()],
      this.liquidityManagementProgramId
    );

    return guardianSettingAddress;
  }

  deriveSplTokenVaultAuthorityAddress(twoWayPegGuardianSetting: PublicKey) {
    const [guardianSettingAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("spl-token-vault-authority"),
        twoWayPegGuardianSetting.toBuffer(),
      ],
      this.liquidityManagementProgramId
    );

    return guardianSettingAddress;
  }

  derivePositionAddress(
    lmGuardianSetting: PublicKey,
    userAddress: PublicKey | null
  ): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        lmGuardianSetting.toBuffer(),
        userAddress?.toBuffer() ?? Buffer.from([]),
      ],
      this.liquidityManagementProgramId
    )[0];
  }

  async getTwoWayPegConfiguration() {
    const filters = [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(
            generateAccountDiscriminator("two-way-peg:configuration")
          ),
        },
      },
    ];

    const twoWayPegConfiguration = await this.connection.getProgramAccounts(
      this.twoWayPegProgramId,
      { filters }
    );

    const twoWayPegConfigurationData = twoWayPegConfiguration.map(
      (twoWayPegConfiguration) =>
        deserializeTwoWayPegConfiguration(
          twoWayPegConfiguration.pubkey,
          twoWayPegConfiguration.account.data.subarray(8)
        )
    );

    return twoWayPegConfigurationData[0];
  }

  async getHotReserveBucketsByBitcoinXOnlyPubkey(
    bitcoinXOnlyPubkey: BitcoinXOnlyPublicKey
  ) {
    const filters = [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(
            generateAccountDiscriminator("two-way-peg:hot-reserve-bucket")
          ),
        },
      },
      {
        memcmp: {
          offset: 169,
          bytes: bs58.encode(bitcoinXOnlyPubkey),
        },
      },
    ];

    const hotReserveBuckets = await this.connection.getProgramAccounts(
      this.twoWayPegProgramId,
      { filters }
    );

    const hotReserveBucketsData = hotReserveBuckets.map((hotReserveBucket) =>
      deserializeHotReserveBucket(
        hotReserveBucket.pubkey,
        hotReserveBucket.account.data.subarray(8)
      )
    );

    return hotReserveBucketsData;
  }

  async getHotReserveBucketsBySolanaPubkey(solanaPubkey: PublicKey) {
    const filters = [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(
            generateAccountDiscriminator("two-way-peg:hot-reserve-bucket")
          ),
        },
      },
      {
        memcmp: {
          offset: 8,
          bytes: solanaPubkey.toBase58(),
        },
      },
    ];

    const hotReserveBuckets = await this.connection.getProgramAccounts(
      this.twoWayPegProgramId,
      { filters }
    );

    const hotReserveBucketsData = hotReserveBuckets.map((hotReserveBucket) =>
      deserializeHotReserveBucket(
        hotReserveBucket.pubkey,
        hotReserveBucket.account.data.subarray(8)
      )
    );

    return hotReserveBucketsData;
  }

  async getPositionsByWallet(solanaPubkey: PublicKey) {
    const filters = [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(
            generateAccountDiscriminator("liquidity-management:position")
          ),
        },
      },
      {
        memcmp: {
          offset: 8,
          bytes: solanaPubkey.toBase58(),
        },
      },
    ];

    const positions = await this.connection.getProgramAccounts(
      this.liquidityManagementProgramId,
      { filters }
    );

    return positions.map((position) => {
      const { data } = position.account;
      return deserializePosition(position.pubkey, data.subarray(8));
    });
  }

  constructCreateHotReserveBucketIx(
    solanaPubkey: PublicKey,
    hotReserveBitcoinXOnlyPublicKey: BitcoinXOnlyPublicKey,
    userBitcoinXOnlyPublicKey: BitcoinXOnlyPublicKey,
    unlockBlockHeight: number,
    guardianSetting: PublicKey,
    guardianCertificate: PublicKey,
    coldReserveBucket: PublicKey,
    layerFeeCollector: PublicKey
  ) {
    const instructionData = Buffer.alloc(createHotReserveBucketSchema.span);
    createHotReserveBucketSchema.encode(
      {
        discriminator: 5,
        scriptPathSpendPublicKey: Uint8Array.from(userBitcoinXOnlyPublicKey),
        lockTime: new BN(unlockBlockHeight),
        validityPeriod: HOT_RESERVE_BUCKET_VALIDITY_PERIOD,
      },
      instructionData
    );

    const configurationPda = this.deriveConfigurationAddress();

    const hotReserveBucketPda = this.deriveHotReserveBucketAddress(
      hotReserveBitcoinXOnlyPublicKey
    );

    const ix = new TransactionInstruction({
      keys: [
        { pubkey: solanaPubkey, isSigner: true, isWritable: true },
        { pubkey: configurationPda, isSigner: false, isWritable: false },
        { pubkey: guardianSetting, isSigner: false, isWritable: false },
        { pubkey: guardianCertificate, isSigner: false, isWritable: false },
        { pubkey: coldReserveBucket, isSigner: false, isWritable: false },
        { pubkey: hotReserveBucketPda, isSigner: false, isWritable: true },
        {
          pubkey: layerFeeCollector,
          isSigner: false,
          isWritable: true,
        },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: true },
      ],
      programId: this.twoWayPegProgramId,
      data: instructionData,
    });

    return ix;
  }

  constructReactivateHotReserveBucketIx(
    hotReserveBucketPda: PublicKey,
    layerFeeCollector: PublicKey
  ) {
    if (!this.walletPublicKey) throw new Error("Wallet is not connected");

    const instructionData = Buffer.alloc(reactivateHotReserveBucketSchema.span);

    reactivateHotReserveBucketSchema.encode(
      {
        discriminator: 7,
        validityPeriod: HOT_RESERVE_BUCKET_VALIDITY_PERIOD,
      },
      instructionData
    );

    const configurationPda = this.deriveConfigurationAddress();

    const ix = new TransactionInstruction({
      keys: [
        {
          pubkey: this.walletPublicKey,
          isSigner: true,
          isWritable: true,
        },
        { pubkey: configurationPda, isSigner: false, isWritable: false },
        { pubkey: hotReserveBucketPda, isSigner: false, isWritable: true },
        {
          pubkey: layerFeeCollector,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: this.twoWayPegProgramId,
      data: instructionData,
    });

    return ix;
  }

  constructAddWithdrawalRequestIx(
    solanaPubkey: PublicKey,
    amount: BN,
    receiverAddress: BitcoinAddress,
    guardianSetting: PublicKey,
    layerFeeCollector: PublicKey
  ) {
    const withdrawalRequestSeed = new BN(Date.now() / 1000); // current slot as Unix timestamp
    const withdrawalRequestPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("withdrawal-request"),
        receiverAddress,
        withdrawalRequestSeed.toArrayLike(Buffer, "le", 4),
      ],
      this.twoWayPegProgramId
    )[0];

    const interactionPda = this.deriveInteraction(
      receiverAddress,
      withdrawalRequestSeed
    );

    const instructionData = Buffer.alloc(addWithdrawalRequestSchema.span);
    addWithdrawalRequestSchema.encode(
      {
        discriminator: 18,
        receiverAddress: Uint8Array.from(receiverAddress),
        currentSlot: new BN(Date.now() / 1000),
        withdrawalAmount: amount,
      },
      instructionData
    );

    const twoWayPegProgramCPIIdentity = this.deriveCpiIdentityAddress();

    const configurationPda = this.deriveConfigurationAddress();

    const lmGuardianSetting =
      this.deriveLiquidityManagementGuardianSettingAddress(guardianSetting);

    const positionPda = this.derivePositionAddress(
      lmGuardianSetting,
      solanaPubkey
    );

    const liquidityManagementConfiguration =
      this.deriveLiquidityManagementConfigurationAddress();

    const ix = new TransactionInstruction({
      keys: [
        { pubkey: solanaPubkey, isSigner: true, isWritable: true },
        {
          pubkey: twoWayPegProgramCPIIdentity,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: configurationPda, isSigner: false, isWritable: false },
        { pubkey: guardianSetting, isSigner: false, isWritable: false },
        { pubkey: lmGuardianSetting, isSigner: false, isWritable: false },
        { pubkey: withdrawalRequestPda, isSigner: false, isWritable: true },
        { pubkey: interactionPda, isSigner: false, isWritable: true },
        { pubkey: positionPda, isSigner: false, isWritable: true },
        {
          pubkey: layerFeeCollector,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: liquidityManagementConfiguration,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: this.liquidityManagementProgramId,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.twoWayPegProgramId,
      data: instructionData,
    });

    return ix;
  }

  constructRetrieveIx(amount: BN, guardianSetting: PublicKey) {
    if (!this.walletPublicKey) throw new Error("Wallet is not connected");
    // TODO: You can customize the retrieve address here

    const userAta = getAssociatedTokenAddressSync(
      this.assetMint,
      this.walletPublicKey,
      true
    );

    const lmGuardianSetting =
      this.deriveLiquidityManagementGuardianSettingAddress(guardianSetting);

    const splTokenVaultAuthority =
      this.deriveSplTokenVaultAuthorityAddress(guardianSetting);

    const vaultAta = getAssociatedTokenAddressSync(
      this.assetMint,
      splTokenVaultAuthority,
      true
    );

    const positionPda = this.derivePositionAddress(
      lmGuardianSetting,
      this.walletPublicKey
    );

    const instructionData = Buffer.alloc(retrieveSchema.span);
    retrieveSchema.encode(
      {
        discriminator: 9,
        amount,
      },
      instructionData
    );

    const ix = new TransactionInstruction({
      keys: [
        {
          pubkey: this.walletPublicKey,
          isSigner: true,
          isWritable: true,
        },
        { pubkey: userAta, isSigner: false, isWritable: true },
        { pubkey: positionPda, isSigner: false, isWritable: true },
        { pubkey: lmGuardianSetting, isSigner: false, isWritable: false },
        { pubkey: splTokenVaultAuthority, isSigner: false, isWritable: false },
        { pubkey: vaultAta, isSigner: false, isWritable: true },
        { pubkey: this.assetMint, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
          pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: this.liquidityManagementProgramId,
      data: instructionData,
    });

    return ix;
  }

  constructStoreIx(amount: BN, guardianSetting: PublicKey) {
    if (!this.walletPublicKey) throw new Error("Wallet is not connected");

    const userAta = getAssociatedTokenAddressSync(
      this.assetMint,
      this.walletPublicKey,
      true
    );

    const lmGuardianSetting =
      this.deriveLiquidityManagementGuardianSettingAddress(guardianSetting);

    const splTokenVaultAuthority =
      this.deriveSplTokenVaultAuthorityAddress(guardianSetting);

    const vaultAta = getAssociatedTokenAddressSync(
      this.assetMint,
      splTokenVaultAuthority,
      true
    );

    const positionPda = this.derivePositionAddress(
      lmGuardianSetting,
      this.walletPublicKey
    );

    const lmConfiguration =
      this.deriveLiquidityManagementConfigurationAddress();

    const instructionData = Buffer.alloc(storeSchema.span);
    storeSchema.encode(
      {
        discriminator: 10,
        amount,
      },
      instructionData
    );

    const ix = new TransactionInstruction({
      keys: [
        {
          pubkey: this.walletPublicKey,
          isSigner: true,
          isWritable: true,
        },
        { pubkey: userAta, isSigner: false, isWritable: true },
        { pubkey: positionPda, isSigner: false, isWritable: true },
        {
          pubkey: lmConfiguration,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: lmGuardianSetting, isSigner: false, isWritable: false },
        { pubkey: guardianSetting, isSigner: false, isWritable: false },
        { pubkey: splTokenVaultAuthority, isSigner: false, isWritable: false },
        { pubkey: vaultAta, isSigner: false, isWritable: true },
        { pubkey: this.assetMint, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: this.liquidityManagementProgramId,
      data: instructionData,
    });

    return ix;
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
