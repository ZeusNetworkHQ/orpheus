import Tabs from "@/components/Tabs/Tabs";

const PortfolioTransactionsTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}) => {
  return (
    <Tabs
      setActiveTab={setActiveTab}
      activeTab={activeTab}
      type="underline"
      layoutName="PortfolioTransactionsTabs"
      tabs={[
        {
          label: "In-Progress",
          icon: "Processing",
        },
        {
          label: "Complete",
          icon: "Clock",
        },
      ]}
    />
  );
};

export default PortfolioTransactionsTabs;
