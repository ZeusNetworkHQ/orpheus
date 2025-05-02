import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import BN from "bn.js";

import { BitcoinAddress, BitcoinXOnlyPublicKey } from "@/types/wallet";
import {
  createHotReserveBucketSchema,
  retrieveSchema,
  storeSchema,
  addWithdrawalRequestSchema,
  reactivateHotReserveBucketSchema,
} from "@/types/zplClient";
import { HOT_RESERVE_BUCKET_VALIDITY_PERIOD } from "@/utils/constant";

import { AccountService } from "./account";

export class InstructionService {
  constructor(
    private walletPublicKey: PublicKey | null,
    private twoWayPegProgramId: PublicKey,
    private liquidityManagementProgramId: PublicKey,
    private assetMint: PublicKey,
    private accountService: AccountService
  ) {}

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
        discriminator: 11,
        scriptPathSpendPublicKey: Uint8Array.from(userBitcoinXOnlyPublicKey),
        lockTime: new BN(unlockBlockHeight),
        validityPeriod: HOT_RESERVE_BUCKET_VALIDITY_PERIOD,
      },
      instructionData
    );

    const configurationPda = this.accountService.deriveConfigurationAddress();

    const hotReserveBucketPda =
      this.accountService.deriveHotReserveBucketAddress(
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
        discriminator: 13,
        validityPeriod: HOT_RESERVE_BUCKET_VALIDITY_PERIOD,
      },
      instructionData
    );

    const configurationPda = this.accountService.deriveConfigurationAddress();

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

    const interactionPda = this.accountService.deriveInteraction(
      receiverAddress,
      withdrawalRequestSeed
    );

    const instructionData = Buffer.alloc(addWithdrawalRequestSchema.span);
    addWithdrawalRequestSchema.encode(
      {
        discriminator: 131,
        receiverAddress: Uint8Array.from(receiverAddress),
        currentSlot: new BN(Date.now() / 1000),
        withdrawalAmount: amount,
      },
      instructionData
    );

    const twoWayPegProgramCPIIdentity =
      this.accountService.deriveCpiIdentityAddress();

    const configurationPda = this.accountService.deriveConfigurationAddress();

    const lmGuardianSetting =
      this.accountService.deriveLiquidityManagementGuardianSettingAddress(
        guardianSetting
      );

    const positionPda = this.accountService.derivePositionAddress(
      lmGuardianSetting,
      solanaPubkey
    );

    const liquidityManagementConfiguration =
      this.accountService.deriveLiquidityManagementConfigurationAddress();

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

  constructRetrieveIx(
    amount: BN,
    guardianSetting: PublicKey,
    receiverAta: PublicKey
  ) {
    if (!this.walletPublicKey) throw new Error("Wallet is not connected");

    const lmGuardianSetting =
      this.accountService.deriveLiquidityManagementGuardianSettingAddress(
        guardianSetting
      );

    const splTokenVaultAuthority =
      this.accountService.deriveSplTokenVaultAuthorityAddress(guardianSetting);

    const vaultAta = getAssociatedTokenAddressSync(
      this.assetMint,
      splTokenVaultAuthority,
      true
    );

    const positionPda = this.accountService.derivePositionAddress(
      lmGuardianSetting,
      this.walletPublicKey
    );

    const instructionData = Buffer.alloc(retrieveSchema.span);
    retrieveSchema.encode(
      {
        discriminator: 21,
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
        { pubkey: receiverAta, isSigner: false, isWritable: true },
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
      this.accountService.deriveLiquidityManagementGuardianSettingAddress(
        guardianSetting
      );

    const splTokenVaultAuthority =
      this.accountService.deriveSplTokenVaultAuthorityAddress(guardianSetting);

    const vaultAta = getAssociatedTokenAddressSync(
      this.assetMint,
      splTokenVaultAuthority,
      true
    );

    const positionPda = this.accountService.derivePositionAddress(
      lmGuardianSetting,
      this.walletPublicKey
    );

    const lmConfiguration =
      this.accountService.deriveLiquidityManagementConfigurationAddress();

    const instructionData = Buffer.alloc(storeSchema.span);
    storeSchema.encode(
      {
        discriminator: 22,
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
}
