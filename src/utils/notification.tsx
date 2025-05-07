import Link from "next/link";
import { toast } from "react-toastify";

import Icon from "@/components/Icons";
import { InteractionType } from "@/types/api";
import { Chain } from "@/types/network";
import { SolanaNetwork } from "@/types/store";

import { getSolanaExplorerUrl } from "./misc";

const TxSuccessMsg = ({
  type,
  txId,
  solanaNetwork,
}: {
  type?: InteractionType;
  txId?: string;
  solanaNetwork?: SolanaNetwork;
}) => {
  return (
    <div className="toast">
      <div className="toast-header">
        <Icon name="Success" />
        <span>Success</span>
      </div>
      {txId && solanaNetwork ? (
        <div className="toast-message">
          Transaction has been processed. View the details on Solana Explorer.
          <br />
          <Link
            href={getSolanaExplorerUrl(solanaNetwork, "tx", txId)}
            className="toast-link toast-link--success"
            target="_blank"
            rel="noreferrer noopener"
          >
            View
          </Link>
        </div>
      ) : (
        <div>
          Transaction has been processed. View the details in your transaction
          history.
          <br />
          <Link
            href={`/portfolio/transactions?type=${type}`}
            className="toast-link toast-link--success"
          >
            View
          </Link>
        </div>
      )}
    </div>
  );
};

const TxFailMsg = ({ chain }: { chain: Chain }) => {
  return (
    <div className="toast">
      <div className="toast-header">
        <Icon name="Error" />
        <span>An Error Occurred</span>
      </div>
      <div className="toast-message">
        {chain}: Transaction failed on {chain}. Please try again.
      </div>
    </div>
  );
};

const notifyTx = (
  isSuccess: boolean,
  params: {
    chain: Chain;
    type?: InteractionType;
    txId?: string;
    solanaNetwork?: SolanaNetwork;
  }
) => {
  const { chain, type, txId, solanaNetwork } = params;

  if (isSuccess && chain === Chain.Solana && txId && solanaNetwork) {
    toast.success(<TxSuccessMsg txId={txId} solanaNetwork={solanaNetwork} />, {
      icon: false,
    });
  } else if (isSuccess) {
    toast.success(<TxSuccessMsg type={type} />, {
      icon: false,
    });
  } else {
    toast.error(<TxFailMsg chain={chain} />, { icon: false });
  }
};

const notifySuccess = (message: string) => {
  toast.success(
    <div className="toast">
      <div className="toast-header">
        <Icon name="Success" />
        <span>Success</span>
      </div>
      <div className="toast-message">{message}</div>
    </div>,
    { icon: false }
  );
};

const notifyError = (message: string) => {
  toast.error(
    <div className="toast">
      <div className="toast-header">
        <Icon name="Error" />
        <span>An Error Occurred</span>
      </div>
      <div className="toast-message">{message}</div>
    </div>,
    { icon: false }
  );
};

const notifyInfo = (message: string) => {
  toast.info(
    <div className="toast">
      <div className="toast-header">
        <Icon name="Info" />
        <span>Info</span>
      </div>
      <div className="toast-message">{message}</div>
    </div>,
    { icon: false }
  );
};

export { notifyTx, notifySuccess, notifyError, notifyInfo };
