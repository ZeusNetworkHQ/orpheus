import classNames from "classnames";

import Icon from "@/components/Icons";

import { Dropdown, DropdownOption } from "../Dropdown/Dropdown";
import wrapImportant from "../wrapImportant";

export interface PaginationProps {
  hasNextPage: boolean;
  currentPage: number;
  itemsPerPage: number;
  showDropdown: boolean;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  handleItemsPerPage: (itemsPerPageOption: number) => void;
}

const Pagination = ({
  hasNextPage,
  currentPage,
  itemsPerPage,
  showDropdown = true,
  handlePrevPage,
  handleNextPage,
  handleItemsPerPage,
}: PaginationProps) => {
  const pageNumbers = [
    currentPage - 1 >= 1 ? currentPage - 1 : null,
    currentPage,
    hasNextPage ? currentPage + 1 : null,
  ];

  return (
    <div
      className={classNames(
        "relative flex flex-col items-center justify-center space-y-24 md:flex-row md:space-y-0"
      )}
    >
      <div
        className={classNames("flex items-center justify-center space-x-4", {
          "md:absolute md:left-1/2 md:ml-auto md:-translate-x-1/2":
            showDropdown,
        })}
      >
        <button
          className={classNames(
            // Default styles
            "gradient-border rounded-12 bg-sys-color-background-card text-sys-color-text-mute before:from-apollo-border-20 before:to-sys-color-text-mute/5 relative flex h-36 w-36 items-center justify-center",
            // Hover styles
            "hover:bg-apollo-brand-primary-blue hover:text-ref-palette-grey-black hover:shadow-[0px_8px_12px_rgba(255,118,88,0.2),inset_0px_2px_6px_#8DB2F7] hover:before:from-white/40 hover:before:to-transparent before:hover:transition",
            // Disabled styles
            "disabled:before:from-apollo-border-20 disabled:before:to-sys-color-text-mute/5 disabled:hover:bg-sys-color-background-card disabled:hover:text-sys-color-text-mute disabled:opacity-40 disabled:hover:shadow-none"
          )}
          onClick={() => {
            handlePrevPage();
          }}
          disabled={currentPage === 1}
        >
          <Icon name="Left" size={14} />
        </button>
        {pageNumbers.map((page) => {
          if (!page) return null;
          return (
            <button
              key={page}
              className={classNames(
                // Default styles
                "gradient-border rounded-12 bg-sys-color-background-card text-sys-color-text-mute before:from-apollo-border-20 before:to-sys-color-text-mute/5 relative flex h-36 w-36 items-center justify-center",
                // Hover styles
                "hover:bg-apollo-brand-primary-blue hover:text-white hover:shadow-[0px_8px_12px_rgba(255,118,88,0.2),inset_0px_2px_6px_#8DB2F7] hover:before:from-white/40 hover:before:to-transparent before:hover:transition",
                {
                  // Selected page
                  "!bg-apollo-brand-primary-blue !text-white shadow-[0px_8px_12px_rgba(255,118,88,0.2),inset_0px_2px_6px_#8DB2F7] before:from-white/40 before:to-transparent":
                    page === currentPage,
                }
              )}
              onClick={() => {
                if (page > currentPage) handleNextPage();
                if (page < currentPage) handlePrevPage();
              }}
            >
              <span className="body-body2-medium">{page}</span>
            </button>
          );
        })}
        <button
          className={classNames(
            // Default styles
            "gradient-border rounded-12 bg-sys-color-background-card text-sys-color-text-mute before:from-apollo-border-20 before:to-sys-color-text-mute/5 relative flex h-36 w-36 items-center justify-center",
            // Hover styles
            "hover:bg-apollo-brand-primary-blue hover:text-ref-palette-grey-black hover:shadow-[0px_8px_12px_rgba(255,118,88,0.2),inset_0px_2px_6px_#8DB2F7] hover:before:from-white/40 hover:before:to-transparent before:hover:transition",
            // Disabled styles
            "disabled:before:from-apollo-border-20 disabled:before:to-sys-color-text-mute/5 disabled:hover:bg-sys-color-background-card disabled:hover:text-sys-color-text-mute disabled:opacity-40 disabled:hover:shadow-none"
          )}
          onClick={() => {
            handleNextPage();
          }}
          disabled={!hasNextPage}
        >
          <Icon name="Right" size={14} />
        </button>
      </div>
      {showDropdown && (
        <div
          className={classNames(
            "flex w-max items-center justify-center gap-x-12 md:ml-auto"
          )}
        >
          <span className="body-body2-medium text-sys-color-text-mute">
            Items per page
          </span>
          <Dropdown
            label={`${itemsPerPage}`}
            selectedIndex={[10, 25, 50].indexOf(itemsPerPage)}
          >
            {[10, 25, 50].map((value, index) => (
              <DropdownOption
                label={`${value}`}
                key={index}
                index={index}
                onClick={() => handleItemsPerPage(value)}
              >
                {`${value}`}
              </DropdownOption>
            ))}
          </Dropdown>
        </div>
      )}
    </div>
  );
};

export default wrapImportant(Pagination);
