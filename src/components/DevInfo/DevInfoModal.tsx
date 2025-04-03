import { useState } from "react";

import Icon from "@/components/Icons";
import { useNetworkConfig } from "@/hooks/misc/useNetworkConfig";
import usePrice from "@/hooks/misc/usePrice";
import useSolanaData from "@/hooks/misc/useSolanaData";
import useTwoWayPegConfiguration from "@/hooks/zpl/useTwoWayPegConfiguration";
import usePersistentStore from "@/stores/persistentStore";
import useStore from "@/stores/store";
import { Chain } from "@/types/network";
import { BitcoinNetwork, SolanaNetwork } from "@/types/store";
import {
  BTC_DECIMALS,
  LINK_TYPE,
  MODAL_NAMES,
  SOLANA_TX_FEE_IN_SOL,
} from "@/utils/constant";
import { formatValue } from "@/utils/format";

import Divider from "../Divider";
import Modal from "../Modal/Modal";
import Tabs from "../Widgets/Tabs/Tabs";

import DevInfoRow from "./subComponents/DevInfoRow";

const getNetworkLabel = (
  networkType: BitcoinNetwork | SolanaNetwork,
  chain: Chain
) => {
  if (chain === Chain.Bitcoin) {
    switch (networkType) {
      case BitcoinNetwork.Regtest:
        return "Muses Testnet (Regtest)";
    }
  } else if (chain === Chain.Solana) {
    switch (networkType) {
      case SolanaNetwork.Devnet:
        return "Solana Devnet";
    }
  }

  return networkType;
};

const getDividerUI = () => {
  return (
    <div className="pt-2">
      <Divider />
    </div>
  );
};

export default function DevInfoModal() {
  const { solanaNetwork, bitcoinNetwork } = usePersistentStore();
  const currentModal = useStore((state) => state.currentModal);
  const closeModal = useStore((state) => state.closeModal);

  const networkConfig = useNetworkConfig();
  const { price: btcPrice } = usePrice("BTCUSDC");
  const { solPrice, feePerTxInUSD } = useSolanaData();
  const { feeRate } = useTwoWayPegConfiguration();

  const [activeTab, setActiveTab] = useState(0);

  const {
    twoWayPegProgramId,
    liquidityManagementProgramId,
    assetMint,
    delegatorProgramId,
    bitcoinSpvProgramId,
    layerCaProgramId,
    bootstrapperProgramId,
  } = networkConfig;

  const devInfoList = [
    [
      {
        title: "",
        value: "",
        list: [
          {
            title: "Bitcoin Price",
            value: `${formatValue(btcPrice, 2)} USD`,
            withIcon: false,
            linkType: LINK_TYPE.NULL,
          },
          {
            title: "Fee Rate",
            value: `${feeRate} sat/vB (~$${formatValue(
              (feeRate / 10 ** BTC_DECIMALS) * btcPrice,
              6
            )})`,
            withIcon: false,
            linkType: LINK_TYPE.NULL,
          },
        ],
      },
    ],
    [
      {
        title: "Solana",
        value: "",
        list: [
          {
            title: "Solana Price",
            value: `${formatValue(solPrice, 2)} USD`,
            withIcon: false,
            linkType: LINK_TYPE.NULL,
          },
          {
            title: "Fee per Transaction",
            value: `${SOLANA_TX_FEE_IN_SOL} SOL (~$${formatValue(feePerTxInUSD, 6)})`,
            withIcon: false,
            linkType: LINK_TYPE.NULL,
          },
        ],
      },
      {
        title: "ZPL Program IDs",
        value: "",
        list: [
          {
            title: "Bootstrapper Program",
            value: bootstrapperProgramId,
            withIcon: true,
            linkType: LINK_TYPE.SOLANA,
          },
          {
            title: "BitcoinSPV Program",
            value: bitcoinSpvProgramId,
            withIcon: true,
            linkType: LINK_TYPE.SOLANA,
          },
          {
            title: "LayerCA Program",
            value: layerCaProgramId,
            withIcon: true,
            linkType: LINK_TYPE.SOLANA,
          },
          {
            title: "Delegator Program",
            value: delegatorProgramId,
            withIcon: true,
            linkType: LINK_TYPE.SOLANA,
          },
          {
            title: "Liquidity Management Program",
            value: liquidityManagementProgramId,
            withIcon: true,
            linkType: LINK_TYPE.SOLANA,
          },
          {
            title: "Two Way Peg Program",
            value: twoWayPegProgramId,
            withIcon: true,
            linkType: LINK_TYPE.SOLANA,
          },
        ],
      },
      {
        title: "zBTC Mint",
        value: assetMint,
        list: [
          {
            title: "zBTC Mint",
            value: assetMint,
            withIcon: true,
            linkType: LINK_TYPE.SOLANA,
          },
        ],
      },
    ],
  ];

  const tabs = [
    {
      label: getNetworkLabel(bitcoinNetwork, Chain.Bitcoin),
      value: "bitcoin",
    },
    {
      label: getNetworkLabel(solanaNetwork, Chain.Solana),
      value: "solana",
    },
  ];

  const handleTabClick = (tabValue: string) => {
    const tabIndex = tabs.findIndex((tab) => tab.value === tabValue);
    setActiveTab(tabIndex);
  };

  return (
    <Modal
      width="515px"
      isOpen={currentModal === MODAL_NAMES.DEV_INFO_MODAL}
      onClose={closeModal}
      isCentered={true}
      cardClasses="!px-3 !pt-5 !pb-3"
    >
      <div className="flex items-center justify-between pb-5 pl-2 pr-1">
        <div className="flex items-center space-x-2">
          <Icon name="DevInfo" />
          <div className="font-semibold text-shade-secondary">Dev Info</div>
        </div>
        <div>
          <div
            onClick={closeModal}
            className="relative h-[18px] w-[18px] cursor-pointer hover:text-shade-primary"
          >
            <Icon name="Close" />
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-6 rounded-2xl border border-shade-mute/15 bg-shade-background p-3">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onClick={handleTabClick}
          loginRequired={false}
          isSubTab
          subTabLayoutStyle="w-full"
          subTabStyle="w-full"
          subTabSelectedTabStyle="rounded-lg"
        />
        <div
          className={`flex flex-col gap-y-6 ${activeTab === 1 && "z-10 max-h-[310px] overflow-y-auto pb-4"}`}
        >
          {devInfoList[activeTab].map((item, index) => (
            <div key={item.title}>
              {item.title && (
                <div className="pb-2 text-lg font-semibold text-shade-primary">
                  {item.title}
                </div>
              )}
              {item.list && item.list.length > 0 && (
                <div className="flex flex-col gap-y-4">
                  {item.list.length === 1 ? (
                    <DevInfoRow
                      value={item.list[0].value ?? ""}
                      linkType={item.list[0].linkType as keyof typeof LINK_TYPE}
                      withIcon={item.list[0].withIcon}
                    />
                  ) : (
                    item.list.map((pda, pdaIndex) => (
                      <div key={pda.title}>
                        <>
                          <div className="pb-1 font-semibold text-shade-secondary">
                            {pda.title}
                          </div>
                          {
                            <DevInfoRow
                              value={pda.value ?? ""}
                              linkType={pda.linkType as keyof typeof LINK_TYPE}
                              withIcon={pda.withIcon}
                            />
                          }
                        </>
                        {pdaIndex !== item.list.length - 1 && getDividerUI()}
                      </div>
                    ))
                  )}
                </div>
              )}
              {index !== devInfoList[activeTab].length - 1 && getDividerUI()}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
