import { Modal, ModalBody, ModalHeader } from "@/components/ModalB/Modal";
import useZbtcMintedDialog from "@/hooks/useZbtcMintedDialog";
import { BTC_DECIMALS } from "@/utils/constant";
import { formatValue } from "@/utils/format";

export default function ReceivedZBTCModal() {
  const {
    isOpen: fetchedIsOpen,
    totalAmount: fetchedTotalAmount,
    handleOnClose: onClose,
  } = useZbtcMintedDialog();

  return (
    <Modal
      width={360}
      type="binary"
      isOpen={fetchedIsOpen}
      onClose={() => onClose()}
      backdropType="overrideHeader"
      className="!overflow-hidden"
    >
      <ModalHeader
        title=""
        onClose={() => onClose()}
        className="text-sys-color-text-secondary !z-10"
      />
      <div className="h-[calc(150px-24px)] pt-8 ">
        <div className="absolute inset-0 h-[150px] w-full bg-[linear-gradient(180deg,rgba(255,103,70,0.12)_0%,rgba(255,103,70,0)_100%),linear-gradient(180deg,rgba(32,32,39,0)_46%,#202027_100%),url('/graphics/claim-finished.webp')] bg-cover bg-center"></div>
        {/* Glow */}
        <video
          loop
          autoPlay
          preload="auto"
          muted
          playsInline
          poster="/videos/first-mint.webp"
          className="video-fade-fix absolute -top-[30%] left-1/2 z-10 w-[200px] -translate-x-1/2 transform"
        >
          <source src="/videos/first-mint.webm" type="video/webm" />
        </video>
      </div>
      <ModalBody className="!py-0">
        <div className="mx-auto flex flex-col items-center justify-center gap-y-8 pb-20 pt-8 text-center">
          <div className="text-sys-color-text-primary headline-headline5">
            Congratulations
          </div>
          <div className="text-sys-color-text-secondary body-body1-semibold text-balance pt-4">
            Your{" "}
            <span className="text-apollo-brand-secondary-orange">
              {formatValue(fetchedTotalAmount.dividedBy(10 ** BTC_DECIMALS), 6)}{" "}
              zBTC
            </span>{" "}
            is already in your account. Redeem & start exploring DeFi
            opportunity.
          </div>
        </div>
        <div className="bg-sys-color-text-mute/10 h-px w-full"></div>
        <div className="body-body2-medium text-sys-color-text-mute pt-20">
          Rewards coming soon. Follow us on{" "}
          <a
            href="https://x.com/ApolloByZeus"
            className="transition hover:text-shade-primary"
          >
            X
          </a>
        </div>
      </ModalBody>
    </Modal>
  );
}
