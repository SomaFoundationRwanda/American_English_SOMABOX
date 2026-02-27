import React from 'react';
import { cn } from "@/lib/utils";

const Progress = ({ value = 0, className, ...props }) => {
    return (
        <div
            className={cn("relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800", className)}
            {...props}
        >
            <div
                className="h-full w-full flex-1 bg-accent-lighter transition-all duration-500 ease-in-out"
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </div>
    );
};

export { Progress };
