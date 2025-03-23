import Icon from "@/components/Icons";
import { cn } from "@/utils/misc";

interface ModalHeaderProps {
  title: string;
  className?: string;
  onBtnClick?: () => void;
}

export default function ModalHeader({
  title,
  className,
  onBtnClick,
}: ModalHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between pb-4", className)}>
      <p className="text-base font-medium text-shade-secondary">{title}</p>
      <div
        onClick={onBtnClick}
        className="h-[18px] w-[18px] cursor-pointer text-shade-mute hover:text-shade-primary"
      >
        <Icon name="Close" />
      </div>
    </div>
  );
}
