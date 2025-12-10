import { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-neutral-900 flex items-center justify-center p-4 md:p-8">
      <div 
        className="relative w-full max-w-[400px] h-[850px] max-h-[calc(100vh-40px)] bg-white md:rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-neutral-800 md:border-[12px]"
        style={{ transform: "translateZ(0)" }} // Creates a containing block for fixed elements
      >
        {/* Notch (only visible on desktop/framed view) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-800 rounded-b-2xl z-[100] hidden md:block pointer-events-none" />
        
        {/* Status Bar Mock */}
        <div className="absolute top-0 left-0 right-0 h-12 z-50 flex justify-between items-start px-6 pt-3 text-xs font-medium text-black pointer-events-none mix-blend-difference text-white">
          <span>9:41</span>
          <div className="flex gap-1.5">
            <div className="w-4 h-2.5 bg-current rounded-[1px]" />
            <div className="w-3 h-2.5 bg-current rounded-[1px]" />
            <div className="w-5 h-2.5 border border-current rounded-[2px] relative">
              <div className="absolute inset-0.5 bg-current" />
            </div>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-gray-50 scrollbar-hide">
          {children}
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full z-[100] pointer-events-none" />
      </div>
    </div>
  );
}
