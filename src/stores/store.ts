import { create } from "zustand";

import { StoreActions, StoreStates } from "@/types/store";

const useStore = create<StoreStates & StoreActions>((set) => ({
  // States
  currentModal: null,
  isGlobalLoaderOpen: false,

  // Actions
  openModalByName: (name: string) => set({ currentModal: name }),
  closeModal: () => set({ currentModal: null }),
  setIsGlobalLoaderOpen: (isOpen: boolean) =>
    set({ isGlobalLoaderOpen: isOpen }),
}));

export default useStore;
