import BigNumber from "bignumber.js";
import Image from "next/image";
import Link from "next/link";

import Icon from "@/components/Icons";
import useInteractionsList from "@/hooks/hermes/useInteractionsList";
import usePersistentStore from "@/stores/persistentStore";
import { InteractionType } from "@/types/api";
import { BTC_DECIMALS, ZEUS_SCAN_URL } from "@/utils/constant";
import { formatValue } from "@/utils/format";
import { getFullZeusScanUrl } from "@/utils/interaction";

import styles from "./styles.module.scss";

const InteractionsList = () => {
  const solanaNetwork = usePersistentStore((state) => state.solanaNetwork);
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);
  const { data: interactionsData } = useInteractionsList();

  return (
    <div className={`${styles.interactionsList}`}>
      <div className={styles.interactionsList__background}></div>
      <div className={styles.interactionsList__content}>
        <div className={styles.interactionsList__content__header}>
          <Icon name="Interaction" />
          <div className={styles.interactionsList__content__header__title}>
            Total {interactionsData?.totalInteractions} Interactions
          </div>
        </div>
        <div className={styles.interactionsList__content__list}>
          {interactionsData?.interactions.items
            .slice(0, 8)
            .map((interaction, index) => (
              <Link
                key={index}
                href={getFullZeusScanUrl(
                  interaction.interaction_id,
                  ZEUS_SCAN_URL,
                  solanaNetwork,
                  bitcoinNetwork
                )}
                target="_blank"
              >
                <div className={styles.interactionsList__content__list__item}>
                  <div
                    className={
                      styles.interactionsList__content__list__item__number
                    }
                  >
                    #{interactionsData.totalInteractions - index}
                  </div>
                  <div
                    className={
                      styles.interactionsList__content__list__item__type
                    }
                  >
                    {interaction.interaction_type === InteractionType.Deposit
                      ? "Deposit"
                      : "Withdrawal"}
                  </div>
                  <div
                    className={
                      styles.interactionsList__content__list__item__amount
                    }
                  >
                    <Image
                      src={`/icons/${interaction.interaction_type === InteractionType.Deposit ? "bitcoin" : "zbtc"}.svg`}
                      alt="token-icon"
                      width={18}
                      height={18}
                    />
                    <span>
                      {formatValue(
                        new BigNumber(interaction.amount).dividedBy(
                          10 ** BTC_DECIMALS
                        ),
                        6
                      )}{" "}
                      {interaction.interaction_type === InteractionType.Deposit
                        ? "BTC"
                        : "zBTC"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default InteractionsList;
