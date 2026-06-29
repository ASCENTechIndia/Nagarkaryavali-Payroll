import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SearchableSelect = ({
  value,
  options = [],
  placeholder = "-- Select --",
  disabled = false,
  loading = false,
  className = "",
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const [triggerWidth, setTriggerWidth] = useState(0);

  const selectedOption = useMemo(() => {
    return options.find(
      (item) => String(item.value) === String(value)
    );
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;

    return options.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  useEffect(() => {

    if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
    }

    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearch("");
    }
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={(val) => {
        if (!disabled) {
          setOpen(val);
        }
      }}
    >
      <PopoverTrigger asChild className="w-full">
        <Button
          type="button"
          variant="outline"
          ref={triggerRef}
          disabled={disabled}
          className={cn(
            "w-full h-9 justify-between font-normal overflow-hidden",
            className
          )}
        >
          <span className="truncate">
            {loading
              ? "Loading..."
              : selectedOption
              ? selectedOption.label
              : placeholder}
          </span>

          <span style={{ fontSize: "12px" }}>
            ▼
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        style={{
            width: triggerWidth,
        }}
        align="start"
        sideOffset={4}
        className="p-2"
      >
        <Input
          ref={inputRef}
          placeholder="Search..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="mb-2 h-9"
        />

        <div
          className="border rounded-md overflow-y-auto"
          style={{ maxHeight: "220px" }}
        >
          {filteredOptions.length === 0 ? (
            <div className="text-center text-gray-500 py-3 text-sm">
              No Record Found
            </div>
          ) : (
            filteredOptions.map((item) => (
              <div
                key={item.value}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 ${
                  String(item.value) === String(value)
                    ? "bg-gray-200 font-medium"
                    : ""
                }`}
              >
                {item.label}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;