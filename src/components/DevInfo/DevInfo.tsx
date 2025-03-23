"use client";

import useStore from "@/stores/store";
import { MODAL_NAMES } from "@/utils/constant";

import packageJson from "../../../package.json";
import Button from "../WalletButton/Button";

import styles from "./styles.module.scss";

export default function DevInfo() {
  const currentModal = useStore((state) => state.currentModal);
  const openModalByName = useStore((state) => state.openModalByName);

  const commitHash = process.env.CF_PAGES_COMMIT_SHA
    ? process.env.CF_PAGES_COMMIT_SHA.slice(0, 8)
    : "Local";

  return (
    <div
      className={`${styles.devInfo} ${currentModal === MODAL_NAMES.DEV_INFO_MODAL ? "md:z-[50]" : "md:z-[10]"}`}
    >
      {process.env.IS_PRODUCTION ? (
        <div className={styles.devInfo__version}>
          <span className="text-shade-mute">v</span>
          {packageJson.version}
        </div>
      ) : (
        <div className={styles.devInfo__version}>{commitHash}</div>
      )}
      <Button
        theme="primary"
        size="badge"
        label="Dev Info"
        classes="!font-[700]"
        onClick={() => openModalByName(MODAL_NAMES.DEV_INFO_MODAL)}
      />
    </div>
  );
}
