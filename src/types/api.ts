import { z } from "zod";

import { Chain } from "./network";

// Binance API
export const priceInfoSchema = z.object({
  price: z.string(),
  symbol: z.string(),
});

export type PriceInfo = z.infer<typeof priceInfoSchema>;

// Zeus Backend Common Response
export interface ZeusBackendResponse<T> {
  _status: number;
  data: T;
}

// Hermes API
export const accumulatedStatsSchema = z.number();

export const interactionAccumulatedSchema = z.object({
  total_interactions_count: z.number(),
  confirmed_interactions_count: z.number(),
  pending_interactions_count: z.number(),
  confirmed_amount: z.number(),
  pending_amount: z.number(),
});

export const dashboardChartSchema = z.array(
  z.object({
    time: z.number(),
    value: z.number(),
  })
);

export const assetVarianceSchema = z.object({
  current: z.number(),
  current_minus_24hr: z.number(),
});

export type DashboardChart = z.infer<typeof dashboardChartSchema>;

export const interactionStepSchema = z.object({
  chain: z.nativeEnum(Chain),
  action: z.string(),
  transaction: z.string(),
  timestamp: z.number(),
});

export const guardianCertificateSchema = z.object({
  name: z.string(),
  address: z.string(),
  entity: z.string(),
  status: z.string(),
});

export enum InteractionStatus {
  // Deposit
  BitcoinDepositToHotReserve = "BitcoinDepositToHotReserve",
  VerifyDepositToHotReserveTransaction = "VerifyDepositToHotReserveTransaction",
  SolanaDepositToHotReserve = "SolanaDepositToHotReserve",
  AddLockToColdReserveProposal = "AddLockToColdReserveProposal",
  BitcoinLockToColdReserve = "BitcoinLockToColdReserve",
  VerifyLockToColdReserveTransaction = "VerifyLockToColdReserveTransaction",
  SolanaLockToColdReserve = "SolanaLockToColdReserve",
  Peg = "Peg",
  Reclaim = "Reclaim",

  // Withdrawal
  AddWithdrawalRequest = "AddWithdrawalRequest",
  AddUnlockToUserProposal = "AddUnlockToUserProposal",
  BitcoinUnlockToUser = "BitcoinUnlockToUser",
  VerifyUnlockToUserTransaction = "VerifyUnlockToUserTransaction",
  SolanaUnlockToUser = "SolanaUnlockToUser",
  Unpeg = "Unpeg",
  DeprecateWithdrawalRequest = "DeprecateWithdrawalRequest",

  Empty = "Empty",
}

export enum InteractionType {
  Deposit = 0,
  Withdrawal = 1,
}

export const interactionSchema = z.object({
  interaction_id: z.string(),
  interaction_type: z.nativeEnum(InteractionType),
  status: z.nativeEnum(InteractionStatus),
  app_developer: z.string(),
  initiated_at: z.number(),
  current_step_at: z.number().optional().nullable(),
  amount: z.string(),
  miner_fee: z.string(),
  service_fee: z.string(),
  source: z.string(),
  destination: z.string(),
  guardian_certificate: guardianCertificateSchema.optional().nullable(),
  guardian_setting: z.string().optional().nullable(),
  steps: z.array(interactionStepSchema).optional().nullable(),
  withdrawal_request_pda: z.string().optional().nullable(),
  deposit_block: z.number().optional().nullable(),
  is_stored: z.boolean().optional(),
});

export const interactionsSchema = z.object({
  items: z.array(interactionSchema),
  cursor: z.string().nullable(),
});

export type Interaction = z.infer<typeof interactionSchema>;
export type Interactions = z.infer<typeof interactionsSchema>;

export const twoWayPegGuardianSettingsScheme = z.object({
  items: z.array(
    z.object({
      address: z.string(),
      seed: z.number(),
      guardian_certificate: z.string(),
      asset_mint: z.string(),
      token_program_id: z.string(),
      spl_token_mint_authority: z.string(),
      spl_token_burn_authority: z.string(),
      total_amount_locked: z.string(),
      total_amount_pegged: z.string(),
    })
  ),
});

export type TwoWayPegGuardianSettings = z.infer<
  typeof twoWayPegGuardianSettingsScheme
>;

// Delegator guardian settings
export const delegatorGuardianSettingsScheme = z.object({
  items: z.array(
    z.object({
      address: z.string(),
      seed: z.number(),
      status: z.number(),
      guardian_certificate: z.string(),
      max_quota: z.string(),
      available_quota: z.string(),
      accumulated_amount: z.string(),
      escrow_balance: z.string(),
      penalty_rate: z.number(),
      delegation_removal_lock_days: z.number(),
      quota_increasing_rate: z.number(),
      delegate_options: z.array(
        z.object({
          lock_days: z.number(),
          initial_rate: z.number(),
          current_rate: z.number(),
        })
      ),
      spl_token_escrow_authority: z.string(),
      spl_token_vault_authority: z.string(),
      created_at: z.number(),
      updated_at: z.number(),
    })
  ),
});

export type DelegatorGuardianSettings = z.infer<
  typeof delegatorGuardianSettingsScheme
>;

// Ares API
export const utxoSchema = z.object({
  transaction_id: z.string(),
  transaction_index: z.number(),
  satoshis: z.number(),
  block_height: z.number(),
});

export const utxosSchema = z.array(utxoSchema);

export type UTXO = z.infer<typeof utxoSchema>;

export type UTXOs = z.infer<typeof utxosSchema>;

export const transactionSchema = z.object({
  transaction: z.string(),
  blockhash: z.string().nullable(),
  confirmations: z.number().nullable(),
  time: z.number().nullable(),
  blocktime: z.number().nullable(),
});

export const claimTBTCSchema = z.object({
  address: z.string(),
  balance: z.number(),
  remainingClaimCounts: z.number(),
});

export type ClaimTBTC = z.infer<typeof claimTBTCSchema>;
