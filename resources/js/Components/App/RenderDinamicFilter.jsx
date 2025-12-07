import { useState, useEffect, useMemo } from "react";
import { MultiSelect } from "./Multiselect/multi-select";

export default function RenderDinamicFilter({
  table,
  columnKey,
  placeholder,
  getLabel,
  selectedValues,
  setSelectedValues,
  uniqueOptions = []
}) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const initialData = table.getPreFilteredRowModel().rows;

  const generateUniqueOptions = useMemo(() => {
    const optionsMap = new Map();

    initialData.forEach((row) => {
      const value = row.original[columnKey];
      if (value === null || value === undefined) return;

      const valuesToProcess = Array.isArray(value) ? value : [value];

      valuesToProcess.forEach((v) => {
        if (v === null || v === undefined) return;

        const key = v.id || v;
        const label = getLabel ? getLabel(v).toString() : v.nombre?.toString() || key.toString();
        optionsMap.set(key, { value: key, label });
      });
    });

    return Array.from(optionsMap.values());
  }, [initialData, columnKey, getLabel]);

  useEffect(() => {
    if (hasInteracted) {
      table.getColumn(columnKey).setFilterValue(selectedValues.length > 0 ? selectedValues : undefined);
    }
  }, [selectedValues, hasInteracted, table, columnKey]);

  const handleValueChange = (values) => {
    setSelectedValues(values);
    setHasInteracted(true);
  };

  const optionsToUse = uniqueOptions.length > 0 ? uniqueOptions : generateUniqueOptions;

  return (
    <MultiSelect
      options={optionsToUse}
      onValueChange={handleValueChange}
      defaultValue={selectedValues}
      placeholder={placeholder}
      maxCount={2}
      className="rounded-full bg-custom-white dark:bg-custom-blackSemi border-2"
    />
  );
}