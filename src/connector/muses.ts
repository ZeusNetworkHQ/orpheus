import { type WalletMetadata } from "./base";
import { InjectedConnector } from "./injected";

export class MusesConnector extends InjectedConnector {
  readonly metadata: WalletMetadata = {
    id: "muses",
    name: "Muses Wallet",
    icon: "/icons/muses.svg",
    downloadUrl: "https://muses.apollobyzeus.app/",
  };

  constructor() {
    super("muses");
    this.isReady = () => {
      return typeof window !== "undefined" && window.muses !== undefined;
    };
  }
}
