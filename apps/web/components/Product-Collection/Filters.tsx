"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

interface FiltersProps {
  onFilterChange?: (filters: Record<string, string | string[]>) => void;
  activeFilters?: Record<string, string | string[]>;
}

export default function Filters({ onFilterChange, activeFilters = {} }: FiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filterOptions = {
    category: ["T-Shirts", "Hoodies", "Polo Shirts", "Sweatshirts"],
    printMethod: ["DTF Print", "Embroidery", "Screen Print", "Direct Print"],
    size: ["XS", "S", "M", "L", "XL", "XXL"],
    color: ["Black", "White", "Navy", "Gray", "Red"],
    priceRange: ["₹0 - ₹500", "₹500 - ₹1000", "₹1000 - ₹2000", "₹2000+"],
  };

  const handleFilterSelect = (key: string, value: string) => {
    const current = activeFilters[key];
    let updated: string | string[];

    if (Array.isArray(current)) {
      if (current.includes(value)) {
        updated = current.filter((v) => v !== value);
      } else {
        updated = [...current, value];
      }
    } else {
      updated = [value];
    }

    if (Array.isArray(updated) && updated.length === 0) {
      const newFilters = { ...activeFilters };
      delete newFilters[key];
      onFilterChange?.(newFilters);
    } else {
      onFilterChange?.({ ...activeFilters, [key]: updated });
    }

    setOpenDropdown(null);
  };

  const handleRemoveFilter = (key: string, value?: string) => {
    if (value) {
      const current = activeFilters[key];
      if (Array.isArray(current)) {
        const updated = current.filter((v) => v !== value);
        if (updated.length === 0) {
          const newFilters = { ...activeFilters };
          delete newFilters[key];
          onFilterChange?.(newFilters);
        } else {
          onFilterChange?.({ ...activeFilters, [key]: updated });
        }
      }
    } else {
      const newFilters = { ...activeFilters };
      delete newFilters[key];
      onFilterChange?.(newFilters);
    }
  };

  const handleClearAll = () => {
    onFilterChange?.({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(filterOptions).map(([key, options]) => (
          <div key={key} className="relative">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === key ? null : key)
              }
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-gray-400 transition"
            >
              {key.replace(/([A-Z])/g, " $1").trim()}
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Dropdown Menu */}
            {openDropdown === key && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
                {options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(activeFilters[key])
                          ? activeFilters[key].includes(option)
                          : false
                      }
                      onChange={() => handleFilterSelect(key, option)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, values]) => {
              const valueArray = Array.isArray(values) ? values : [values];
              return valueArray.map((value) => (
                <div
                  key={`${key}-${value}`}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  <span className="text-gray-700">{value}</span>
                  <button
                    onClick={() => handleRemoveFilter(key, value)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ));
            })}
          </div>
          <button
            onClick={handleClearAll}
            className="text-sm text-orange-500 font-medium hover:text-orange-600 transition"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
