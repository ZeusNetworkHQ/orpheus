import {
  Icon,
  IconName,
  Divider,
  Table,
  TableRow,
  TableCell,
  Tooltip,
} from "@zeus-network/design-system/components";
import classNames from "classnames";
import Link from "next/link";
import { Fragment, useState } from "react";

import Button from "@/new-components/Button/Button";
import { Modal, ModalHeader } from "@/new-components/Modal/Modal";
import {
  TransactionDetailsAsset,
  TransactionDetailsStatusItems,
  TransactionDetailsTableItems,
} from "@/types/transaction";
import { shortenString } from "@/utils/format";
import { cn } from "@/utils/misc";

import StatusBar from "../StatusBar/StatusBar";

export interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "deposit" | "withdraw" | "redeem";
  assetFrom: TransactionDetailsAsset;
  assetTo?: TransactionDetailsAsset;
  statusItems: TransactionDetailsStatusItems;
  tableItems: TransactionDetailsTableItems | null;
  actionButton?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
}

export default function TransactionDetailsModal({
  isOpen,
  onClose,
  type,
  assetFrom,
  assetTo,
  statusItems,
  tableItems,
  actionButton,
}: TransactionDetailsModalProps) {
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };
  const [tooltipItemIndex, setTooltipItemIndex] = useState<number | null>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width={650}
      backdropType="overrideHeader"
      className="!overflow-visible !px-16 !pb-0 !pt-20"
    >
      <ModalHeader className="!top-24 right-16 z-10" onClose={onClose} />
      <div className="z-40 flex w-full flex-col gap-y-40 pt-24 sm:pt-0">
        <div className="flex w-full flex-col items-center gap-y-24">
          {/* Header */}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-x-12">
              <Icon
                name="Transaction"
                size={18}
                className="text-apollo-brand-primary-orange"
              />
              <span className="body-body1-medium text-sys-color-text-secondary">
                Transaction Details
              </span>
            </div>
          </div>

          {/* Asset */}
          <TransactionDetailsAssetBanner
            type={type}
            assetFrom={assetFrom}
            assetTo={assetTo}
          />

          {/* Status */}
          {statusItems && <StatusBar statusItems={statusItems} />}

          {/* Action Button */}
          {actionButton && (
            <Button
              className="z-10 max-w-[15rem]"
              type="secondary"
              onClick={actionButton.onClick}
              label={actionButton.label}
              disabled={actionButton.disabled}
            />
          )}
        </div>

        {/* Table */}
        {tableItems && (
          <Table
            tableType="default"
            variant="separated"
            width="stretch"
            lastItemAlignEnd
            columnSizes={[5, 11]}
            allowOverflow
            // Separated table has default padding on the so needs to be removed here
            className="!p-0 md:!px-0"
          >
            {tableItems.map((item, index) => (
              <Fragment key={item.label.label}>
                <TableRow size="medium/16px">
                  <TableCell
                    className={cn(
                      "text-sys-color-text-secondary items-center !px-0 sm:!pl-8",
                      item.label.rightIcon === "InfoSmall" && "relative z-10"
                    )}
                    leftIcon={item.label.leftIcon}
                    rightIcon={item.label.rightIcon}
                    rightIconSize={14}
                    rightIconClassName={cn(
                      item.label.rightIcon === "InfoSmall" &&
                        "cursor-pointer text-shade-mute"
                    )}
                    rightIconOnMouseEnter={() => {
                      if (item.label.rightIcon === "InfoSmall") {
                        setTooltipItemIndex(index);
                      }
                    }}
                    rightIconOnMouseLeave={() => {
                      if (item.label.rightIcon === "InfoSmall") {
                        setTooltipItemIndex(null);
                      }
                    }}
                  >
                    {item.label.rightIcon === "InfoSmall" &&
                      tooltipItemIndex === index && (
                        <div className="absolute left-[105px] top-[40px]">
                          <Tooltip
                            isOpen={true}
                            arrowPosition="top-middle"
                            theme="dark-alt"
                            width={255}
                          >
                            <p className="text-sys-color-text-secondary px-3 py-2 text-center">
                              {item.label.info}
                            </p>
                          </Tooltip>
                        </div>
                      )}
                    <span className="body-body1-medium">
                      {item.label.label}
                    </span>
                    {item.label.caption && (
                      <span className="body-body1-medium sm:body-body2-medium text-sys-color-text-mute">
                        ({item.label.caption})
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-sys-color-text-secondary z-10 !px-0 transition sm:!px-16",
                      item.value.rightIcon === "NewWindow" &&
                        "hover:!text-sys-color-text-primary cursor-pointer"
                    )}
                    rightIcon={item.value.rightIcon}
                    leftIcon={item.value.leftIcon}
                    rightIconClassName={cn(
                      "hover:!text-sys-color-text-primary"
                    )}
                    rightIconOnClick={
                      item.value.rightIcon === "Copy"
                        ? () => handleCopy(item.value.label)
                        : undefined
                    }
                  >
                    {item.value.link ? (
                      <Link
                        href={item.value.link}
                        target="_blank"
                        className="hover:!text-sys-color-text-primary"
                      >
                        {shortenString(item.value.label, 20)}
                      </Link>
                    ) : (
                      shortenString(item.value.label, 20)
                    )}
                  </TableCell>
                </TableRow>
                {index !== tableItems.length - 1 && (
                  <Divider className="sm:!px-8" />
                )}
              </Fragment>
            ))}
          </Table>
        )}
      </div>
    </Modal>
  );
}

const TransactionDetailsAssetBanner = ({
  type,
  assetFrom,
  assetTo,
}: Pick<TransactionDetailsModalProps, "type" | "assetFrom" | "assetTo">) => {
  return (
    <div
      className={classNames(
        "gradient-border rounded-12 flex w-full flex-col gap-x-24 gap-y-16 px-12 py-20 sm:flex-row sm:items-center sm:gap-y-0 sm:px-40 sm:py-16",
        {
          // Deposit
          "bg-[linear-gradient(90.83deg,rgba(255,103,70,0.08)_0%,rgba(255,103,70,0.0500765)_15%,rgba(15,15,18,0)_30%,rgba(15,15,18,0.0540223)_70%,rgba(123,92,175,0.0711953)_83.22%,rgba(178,131,255,0.08)_90%,rgba(253,131,255,0.08)_100%),linear-gradient(90deg,#16161B,#16161B)] before:[background:linear-gradient(90deg,rgba(255,103,70,0.25)_0%,rgba(15,15,18,0.25)_48.72%,rgba(255,191,131,0.25)_78.22%,rgba(253,131,255,0.25)_88.22%,rgba(178,131,255,0.25)_99.72%),rgba(139,138,158,0.2)] sm:justify-between":
            type === "deposit",
          // Withdrawal
          "bg-[linear-gradient(90.83deg,rgba(253,131,255,0.08)_0%,rgba(178,131,255,0.08)_10%,rgba(123,92,175,0.0711953)_16.78%,rgba(15,15,18,0.0540223)_30%,rgba(15,15,18,0)_70%,rgba(255,103,70,0.0500765)_85%,rgba(255,103,70,0.08)_100%),linear-gradient(90deg,#16161B,#16161B)] before:[background:linear-gradient(90deg,rgba(253,131,255,0.25)_0%,rgba(178,131,255,0.25)_10%,rgba(123,92,175,0.25)_16.78%,rgba(15,15,18,0.25)_30%,rgba(15,15,18,0.25)_70%,rgba(255,103,70,0.25)_85%,rgba(255,103,70,0.25)_100%)] sm:justify-between":
            type === "withdraw",
          // Redeem
          "bg-[linear-gradient(90.83deg,rgba(253,131,255,0.08)_0%,rgba(178,131,255,0.08)_10%,rgba(123,92,175,0.0711953)_16.78%,rgba(15,15,18,0.0540223)_30%,rgba(15,15,18,0)_70%,rgba(123,92,175,0.07)_85%,rgba(215,131,255,0.08)_90%,rgba(253,131,255,0.08)_100%),linear-gradient(90deg,#16161B,#16161B)] before:[background:linear-gradient(90deg,rgba(253,131,255,0.25)_0%,rgba(178,131,255,0.25)_10%,rgba(123,92,175,0.25)_16.78%,rgba(15,15,18,0.25)_30%,rgba(15,15,18,0.25)_70%,rgba(123,92,175,0.25)_85%,rgba(215,131,255,0.25)_90%,rgba(253,131,255,0.25)_100%)] sm:justify-center":
            type === "redeem",
        }
      )}
    >
      <>
        <div className="flex w-full flex-row justify-between gap-y-8 sm:w-auto sm:flex-col sm:justify-start">
          {type === "deposit" && (
            <span className="body-body2-medium text-sys-color-text-secondary">
              Locked
            </span>
          )}
          {type === "withdraw" && (
            <span className="body-body2-medium text-sys-color-text-secondary">
              Burned
            </span>
          )}
          {type === "redeem" && (
            <span className="body-body2-medium text-sys-color-text-secondary text-center">
              Redeem
            </span>
          )}

          <div className="flex items-center gap-x-8">
            <Icon name={assetFrom.name.toLowerCase() as IconName} size={18} />
            <span className="body-body1-medium sm:headline-headline4 text-sys-color-text-primary">
              {assetFrom.amount}
              <span className="text-sys-color-text-secondary body-body1-medium sm:headline-headline6">
                {""} {assetFrom.name}
              </span>
            </span>
            {assetFrom.isLocked && (
              <Icon name="Locks" className="text-sys-color-text-secondary" />
            )}
          </div>
        </div>

        {assetTo && (
          <Icon
            name="DoubleRight"
            className="text-sys-color-text-primary hidden flex-shrink-0 sm:block"
            size={24 as 18 | 14 | 12}
          />
        )}

        {assetTo && (
          <div className="flex w-full flex-row items-center justify-between gap-y-8 sm:w-auto sm:flex-col sm:items-start sm:justify-start">
            {type === "deposit" && (
              <span className="body-body2-medium text-sys-color-text-secondary">
                Minted
              </span>
            )}
            {type === "withdraw" && (
              <span className="body-body2-medium text-sys-color-text-secondary">
                Unlocked
              </span>
            )}
            <div className="flex items-center gap-x-8">
              <Icon name={assetTo.name.toLowerCase() as IconName} size={18} />
              <span className="body-body1-medium sm:headline-headline4 text-sys-color-text-primary">
                {assetTo.amount}
                <span className="text-sys-color-text-secondary body-body1-medium sm:headline-headline6">
                  {""} {assetTo.name}
                </span>
              </span>
              {assetTo.isLocked && (
                <Icon name="Locks" className="text-sys-color-text-secondary" />
              )}
            </div>
          </div>
        )}
      </>
    </div>
  );
};
