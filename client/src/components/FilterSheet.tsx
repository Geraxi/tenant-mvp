import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";

export interface FilterOptions {
  priceRange: [number, number];
  beds: number | null;
  baths: number | null;
  ageRange: [number, number];
  gender: string | null;
}

const getDefaultFilters = (): FilterOptions => ({
  priceRange: [0, 5000],
  beds: null,
  baths: null,
  ageRange: [18, 65],
  gender: null,
});

interface FilterSheetProps {
  type: "property" | "roommate";
  onApply?: (filters: FilterOptions) => void;
  trigger?: React.ReactNode;
  currentFilters?: FilterOptions | null;
}

export function FilterSheet({ type, onApply, trigger, currentFilters }: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(currentFilters || getDefaultFilters());

  useEffect(() => {
    if (open && currentFilters) {
      setFilters(currentFilters);
    } else if (open && !currentFilters) {
      setFilters(getDefaultFilters());
    }
  }, [open, currentFilters]);

  const handleApply = () => {
    onApply?.(filters);
    setOpen(false);
  };

  const handleReset = () => {
    const defaults = getDefaultFilters();
    setFilters(defaults);
    onApply?.(defaults);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <button className="p-2 text-gray-600 hover:text-primary transition-colors" data-testid="button-filter">
            <Filter className="w-5 h-5" />
          </button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
            <button 
              onClick={handleReset}
              className="text-sm text-primary font-medium hover:underline"
              data-testid="button-filter-reset"
            >
              Reset
            </button>
          </div>
        </SheetHeader>
        
        <div className="space-y-6 pb-6">
          {type === "property" ? (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Price Range: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}/mo
                </label>
                <div className="px-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => {
                      if (Array.isArray(value) && value.length === 2) {
                        setFilters({ ...filters, priceRange: [value[0], value[1]] as [number, number] });
                      }
                    }}
                    min={0}
                    max={10000}
                    step={100}
                    className="mt-2"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-2">
                  <span>$0</span>
                  <span>$10,000</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Bedrooms</label>
                <div className="flex gap-2">
                  {[null, 1, 2, 3, 4].map((num) => (
                    <button
                      key={num ?? "any"}
                      onClick={() => setFilters({ ...filters, beds: num })}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                        filters.beds === num
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      data-testid={`button-filter-beds-${num ?? "any"}`}
                    >
                      {num === null ? "Any" : `${num}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Bathrooms</label>
                <div className="flex gap-2">
                  {[null, 1, 2, 3].map((num) => (
                    <button
                      key={num ?? "any"}
                      onClick={() => setFilters({ ...filters, baths: num })}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                        filters.baths === num
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      data-testid={`button-filter-baths-${num ?? "any"}`}
                    >
                      {num === null ? "Any" : `${num}+`}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years
                </label>
                <div className="px-2">
                  <Slider
                    value={filters.ageRange}
                    onValueChange={(value) => {
                      if (Array.isArray(value) && value.length === 2) {
                        setFilters({ ...filters, ageRange: [value[0], value[1]] as [number, number] });
                      }
                    }}
                    min={18}
                    max={80}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-2">
                  <span>18</span>
                  <span>80</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Gender Preference</label>
                <div className="flex gap-2">
                  {[null, "male", "female", "other"].map((g) => (
                    <button
                      key={g ?? "any"}
                      onClick={() => setFilters({ ...filters, gender: g })}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors capitalize ${
                        filters.gender === g
                          ? "bg-secondary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      data-testid={`button-filter-gender-${g ?? "any"}`}
                    >
                      {g === null ? "Any" : g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Budget: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}/mo
                </label>
                <div className="px-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => {
                      if (Array.isArray(value) && value.length === 2) {
                        setFilters({ ...filters, priceRange: [value[0], value[1]] as [number, number] });
                      }
                    }}
                    min={0}
                    max={5000}
                    step={50}
                    className="mt-2"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-2">
                  <span>$0</span>
                  <span>$5,000</span>
                </div>
              </div>
            </>
          )}
        </div>

        <Button 
          onClick={handleApply}
          className="w-full rounded-2xl py-6 text-base font-bold"
          data-testid="button-filter-apply"
        >
          Apply Filters
        </Button>
      </SheetContent>
    </Sheet>
  );
}
