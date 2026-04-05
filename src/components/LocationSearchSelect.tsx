import { useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";

type LocationSearchSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

const LocationSearchSelect = ({
  value,
  onChange,
  options,
  placeholder = "Search and select state/UT",
  required = false,
  disabled = false,
  className = "",
}: LocationSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) {
      return options;
    }
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, value]);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // Keep menu open while interacting inside this component.
    if (containerRef.current?.contains(event.relatedTarget as Node)) {
      return;
    }
    setOpen(false);
  };

  const selectOption = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`.trim()}
      onBlur={handleBlur}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            if (!open) {
              setOpen(true);
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-10 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Toggle location options"
          tabIndex={-1}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 dark:text-slate-200 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-200"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectOption(option);
                  }}
                >
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  {option}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                No matching state/UT found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearchSelect;
