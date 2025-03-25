import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import bs58 from "bs58";
import { sha256 } from "js-sha256";

import { BitcoinXOnlyPublicKey } from "@/types/wallet";
import {
  HotReserveBucket,
  hotReserveBucketSchema,
  positionSchema,
  Position,
  TwoWayPegConfiguration,
  twoWayPegConfigurationSchema,
  ColdReserveBucket,
  coldReserveBucketSchema,
} from "@/types/zplClient";

// Helper functions
function generateAccountDiscriminator(input: string): Buffer {
  const preImage = Buffer.from(input);
  return Buffer.from(sha256(preImage), "hex").subarray(0, 8);
}

export function deserializeColdReserveBucket(
  publicKey: PublicKey,
  data?: Buffer
): ColdReserveBucket {
  if (!data) throw new Error("Data is undefined");

  const {
    guardianSetting,
    owner,
    taprootXOnlyPublicKey,
    tapTweakHash,
    createdAt,
    keyPathSpendPublicKey,
    recoveryParameters,
  } = coldReserveBucketSchema.decode(data);
  return {
    publicKey,
    guardianSetting,
    owner,
    taprootXOnlyPublicKey,
    tapTweakHash,
    createdAt,
    keyPathSpendPublicKey,
    recoveryParameters,
  };
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

export class AccountService {
  constructor(
    private connection: Connection,
    private twoWayPegProgramId: PublicKey,
    private liquidityManagementProgramId: PublicKey
  ) {}

  // Address derivation methods
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

  // Query methods
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

  async getColdReserveBuckets() {
    const filters = [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(
            generateAccountDiscriminator("two-way-peg:cold-reserve-bucket")
          ),
        },
      },
    ];

    const accounts = await this.connection.getProgramAccounts(
      this.twoWayPegProgramId,
      { filters }
    );

    const accountsData = accounts
      .map((account) => {
        const { data } = account.account;
        return deserializeColdReserveBucket(account.pubkey, data.subarray(8));
      })
      .toSorted((a, b) => b.createdAt.cmp(a.createdAt))
      .reduce((acc, current) => {
        if (
          !acc.some(
            (item) =>
              item.guardianSetting.toBase58() ===
              current.guardianSetting.toBase58()
          )
        ) {
          acc.push(current);
        }
        return acc;
      }, [] as ColdReserveBucket[]);

    return accountsData;
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
}
