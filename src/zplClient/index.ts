import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import BN from "bn.js";

import { BitcoinAddress, BitcoinXOnlyPublicKey } from "@/types/wallet";

import { AccountService } from "./account";
import { InstructionService } from "./instruction";
import { RpcClient } from "./rpcClient";

export class ZplClient {
  private accountService: AccountService;
  private instructionService: InstructionService;
  private rpcClient: RpcClient;
  private twoWayPegProgramId: PublicKey;
  private liquidityManagementProgramId: PublicKey;
  private assetMint: PublicKey;

  constructor(
    connection: Connection,
    walletPublicKey: PublicKey | null,
    signTransaction:
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

    this.accountService = new AccountService(
      connection,
      this.twoWayPegProgramId,
      this.liquidityManagementProgramId
    );

    this.instructionService = new InstructionService(
      walletPublicKey,
      this.twoWayPegProgramId,
      this.liquidityManagementProgramId,
      this.assetMint,
      this.accountService
    );

    this.rpcClient = new RpcClient(
      connection,
      walletPublicKey,
      signTransaction
    );
  }

  // Account service methods
  deriveConfigurationAddress() {
    return this.accountService.deriveConfigurationAddress();
  }

  deriveCpiIdentityAddress() {
    return this.accountService.deriveCpiIdentityAddress();
  }

  deriveHotReserveBucketAddress(
    hotReserveBitcoinXOnlyPublicKey: BitcoinXOnlyPublicKey
  ): PublicKey {
    return this.accountService.deriveHotReserveBucketAddress(
      hotReserveBitcoinXOnlyPublicKey
    );
  }

  deriveInteraction(seed1: Buffer, seed2: BN) {
    return this.accountService.deriveInteraction(seed1, seed2);
  }

  deriveLiquidityManagementConfigurationAddress() {
    return this.accountService.deriveLiquidityManagementConfigurationAddress();
  }

  deriveLiquidityManagementGuardianSettingAddress(
    twoWayPegGuardianSetting: PublicKey
  ) {
    return this.accountService.deriveLiquidityManagementGuardianSettingAddress(
      twoWayPegGuardianSetting
    );
  }

  deriveSplTokenVaultAuthorityAddress(twoWayPegGuardianSetting: PublicKey) {
    return this.accountService.deriveSplTokenVaultAuthorityAddress(
      twoWayPegGuardianSetting
    );
  }

  derivePositionAddress(
    lmGuardianSetting: PublicKey,
    userAddress: PublicKey | null
  ): PublicKey {
    return this.accountService.derivePositionAddress(
      lmGuardianSetting,
      userAddress
    );
  }

  async getTwoWayPegConfiguration() {
    return this.accountService.getTwoWayPegConfiguration();
  }

  async getColdReserveBuckets() {
    return this.accountService.getColdReserveBuckets();
  }

  async getHotReserveBucketsByBitcoinXOnlyPubkey(
    bitcoinXOnlyPubkey: BitcoinXOnlyPublicKey
  ) {
    return this.accountService.getHotReserveBucketsByBitcoinXOnlyPubkey(
      bitcoinXOnlyPubkey
    );
  }

  async getHotReserveBucketsBySolanaPubkey(solanaPubkey: PublicKey) {
    return this.accountService.getHotReserveBucketsBySolanaPubkey(solanaPubkey);
  }

  async getPositionsByWallet(solanaPubkey: PublicKey) {
    return this.accountService.getPositionsByWallet(solanaPubkey);
  }

  // Instruction service methods
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
    return this.instructionService.constructCreateHotReserveBucketIx(
      solanaPubkey,
      hotReserveBitcoinXOnlyPublicKey,
      userBitcoinXOnlyPublicKey,
      unlockBlockHeight,
      guardianSetting,
      guardianCertificate,
      coldReserveBucket,
      layerFeeCollector
    );
  }

  constructReactivateHotReserveBucketIx(
    hotReserveBucketPda: PublicKey,
    layerFeeCollector: PublicKey
  ) {
    return this.instructionService.constructReactivateHotReserveBucketIx(
      hotReserveBucketPda,
      layerFeeCollector
    );
  }

  constructAddWithdrawalRequestIx(
    solanaPubkey: PublicKey,
    amount: BN,
    receiverAddress: BitcoinAddress,
    guardianSetting: PublicKey,
    layerFeeCollector: PublicKey
  ) {
    return this.instructionService.constructAddWithdrawalRequestIx(
      solanaPubkey,
      amount,
      receiverAddress,
      guardianSetting,
      layerFeeCollector
    );
  }

  constructRetrieveIx(
    amount: BN,
    guardianSetting: PublicKey,
    receiverAta: PublicKey
  ) {
    return this.instructionService.constructRetrieveIx(
      amount,
      guardianSetting,
      receiverAta
    );
  }

  constructStoreIx(amount: BN, guardianSetting: PublicKey) {
    return this.instructionService.constructStoreIx(amount, guardianSetting);
  }

  // RPC client methods
  async signAndSendTransactionWithInstructions(
    ixs: TransactionInstruction[],
    lookupTableAccounts?: AddressLookupTableAccount[]
  ) {
    return this.rpcClient.signAndSendTransactionWithInstructions(
      ixs,
      lookupTableAccounts
    );
  }
}
