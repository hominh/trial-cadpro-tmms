"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseJsonObject } from "../../utils/json-config";
export function JsonObjectEditor({
  id,
  label,
  value,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  const result = useMemo(() => parseJsonObject(value), [value]);
  return (
    <div className={"field grid gap-[0.35rem]"}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(result.error)}
        aria-describedby={result.error ? `${id}-error` : undefined}
        rows={6}
        spellCheck={false}
      />
      {result.error ? (
        <p id={`${id}-error`} className={"field-error text-[#b42318] text-[0.82rem]"} role="alert">
          {result.error}
          {result.line ? ` (dòng ${result.line}, cột ${result.column})` : ""}
        </p>
      ) : null}
    </div>
  );
}
