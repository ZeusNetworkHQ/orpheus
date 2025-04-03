import AlertIcon from "./Alert";
import BtcIcon from "./Btc";
import BurgerIcon from "./Burger";
import ButtonArrowIcon from "./ButtonArrow";
import ButtonLoaderIcon from "./ButtonLoader";
import ChevronDownIcon from "./ChevronDown";
import ChevronDownSmallIcon from "./ChevronDownSmall";
import ClaimIcon from "./Claim";
import ClockIcon from "./Clock";
import CloseIcon from "./Close";
import CloseCircleIcon from "./CloseCircle";
import CopyIcon from "./Copy";
import DevInfoIcon from "./DevInfo";
import DiscordIcon from "./Disconnected";
import DisconnectedIcon from "./Disconnected";
import DoubleRightIcon from "./DoubleRight";
import DropdownSmallIcon from "./DropdownSmall";
import ErrorIcon from "./Error";
import Filter from "./Filter";
import InfoIcon from "./Info";
import InfoSmallIcon from "./InfoSmall";
import InteractionIcon from "./InteractionsIcon";
import LeftIcon from "./Left";
import LinkIcon from "./Link";
import LockIcon from "./LockIcon";
import LocksIcon from "./Locks";
import NetworkIcon from "./Network";
import NewWindowIcon from "./NewWindow";
import NoteSmallIcon from "./NoteSmall";
import PortfolioIcon from "./Portfolio";
import ProcessingIcon from "./Processing";
import ProvideIcon from "./Provide";
import RightIcon from "./Right";
import SolIcon from "./Sol";
import SolanaIcon from "./Solana";
import StakeIcon from "./Stake";
import SuccessIcon from "./Success";
import SwapIcon from "./Swap";
import TickIcon from "./TickIcon";
import TransactionIcon from "./Transaction";
import WalletIcon from "./Wallet";
import WalletSmallIcon from "./WalletSmall";
import Withdraw01Icon from "./Withdraw01";
import Withdraw02Icon from "./Withdraw02";
import ZbtcIcon from "./Zbtc";

export const IconComponents = {
  Alert: AlertIcon,
  ButtonArrow: ButtonArrowIcon,
  ButtonLoader: ButtonLoaderIcon,
  Burger: BurgerIcon,
  btc: BtcIcon,
  ChevronDown: ChevronDownIcon,
  ChevronDownSmall: ChevronDownSmallIcon,
  Claim: ClaimIcon,
  Clock: ClockIcon,
  Close: CloseIcon,
  CloseCircle: CloseCircleIcon,
  Copy: CopyIcon,
  DevInfo: DevInfoIcon,
  Discord: DiscordIcon,
  Disconnected: DisconnectedIcon,
  DoubleRight: DoubleRightIcon,
  DropdownSmall: DropdownSmallIcon,
  Error: ErrorIcon,
  Filter: Filter,
  Info: InfoIcon,
  InfoSmall: InfoSmallIcon,
  Interaction: InteractionIcon,
  Left: LeftIcon,
  Link: LinkIcon,
  Lock: LockIcon,
  Locks: LocksIcon,
  Network: NetworkIcon,
  NewWindow: NewWindowIcon,
  NoteSmall: NoteSmallIcon,
  Portfolio: PortfolioIcon,
  Processing: ProcessingIcon,
  Provide: ProvideIcon,
  Right: RightIcon,
  Stake: StakeIcon,
  solana: SolanaIcon,
  Sol: SolIcon,
  Success: SuccessIcon,
  Swap: SwapIcon,
  Tick: TickIcon,
  Transaction: TransactionIcon,
  Wallet: WalletIcon,
  WalletSmall: WalletSmallIcon,
  Withdraw01: Withdraw01Icon,
  Withdraw02: Withdraw02Icon,
  zbtc: ZbtcIcon,
} as const;

export type IconName = keyof typeof IconComponents;
