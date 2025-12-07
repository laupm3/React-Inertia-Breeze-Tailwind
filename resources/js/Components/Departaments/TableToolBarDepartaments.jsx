// TableToolBardepartamentsDepartaments.jsx
import React, { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Search, Plus } from 'lucide-react';

export function TableToolBarDepartaments({ table }) {
  const [filter, setFilter] = useState("");

  const handleFilterChange = (event) => {
    const value = event.target.value;
    setFilter(value);

    table.getColumn("departament")?.setFilterValue(value);
  };

  return (
    <div>
      <h1 className="absolute top-24 bg-custom-gray-default dark:bg-custom-blackLight text-custom-blue dark:text-custom-white font-bold text-lg px-2">
        Departaments
      </h1>

      <div className="flex items-departament justify-between ">
        <div className="relative">
          <Input
            placeholder="Filter by center name"
            className="pl-10 bg-custom-gray-default text-custom-black rounded-full"
            value={filter}
            onChange={handleFilterChange} // El filtro se aplica aquí
          />
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">
            <Search className="w-4 h-4" />
          </span>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="rounded-full bg-custom-orange text-white ml-4 flex items-center space-x-2"
          >
            <Plus className="w-5" />
            <span className="hidden sm:inline">Add departament</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
