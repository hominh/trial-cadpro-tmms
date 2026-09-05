import * as React from "react";
import { cn } from "@/lib/utils";

export const Table = ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div
    className={
      "table-wrap max-w-[100%] overflow-x-auto [border:1px_solid_#d6dad3] rounded-[0.7rem] bg-white"
    }
  >
    <table
      className={cn(
        "table w-full border-collapse text-[0.88rem] [&_th]:p-[0.75rem] [&_th]:text-left [&_th]:[border-bottom:1px_solid_#d6dad3] [&_th]:whitespace-nowrap [&_td]:p-[0.75rem] [&_td]:text-left [&_td]:[border-bottom:1px_solid_#d6dad3] [&_td]:whitespace-nowrap [&_th]:text-[#5b6b65] [&_th]:text-[0.72rem] [&_th]:uppercase [&_th]:tracking-[0.06em] [&_tr[data-selected='true']]:[background:#e6f2ed]",
        className
      )}
      {...props}
    />
  </div>
);
export const TableHeader = (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead {...props} />
);
export const TableBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody {...props} />
);
export const TableRow = (props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />;
export const TableHead = (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...props} />;
export const TableCell = (props: React.TdHTMLAttributes<HTMLTableCellElement>) => <td {...props} />;
