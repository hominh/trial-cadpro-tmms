import * as React from "react";
import { cn } from "@/lib/utils";

export const Table = ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="table-wrap">
    <table className={cn("table", className)} {...props} />
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
