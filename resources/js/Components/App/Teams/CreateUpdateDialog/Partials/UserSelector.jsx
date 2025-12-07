import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/Components/ui/popover";
import { Checkbox } from "@/Components/ui/checkbox";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/Components/ui/input";
import Icon from '@/imports/LucideIcon'

function UserSelector({ selectedUsers, handleChange, localData }) {
  const [options, setOptions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(route('api.v1.admin.users.index'));

        if (response.status === 200) {
          const localEmails = new Set([
            ...localData?.users?.map(user => user.email),
            ...localData?.teamInvitations?.map(inv => inv.email),
            localData?.owner?.email,
          ]);

          const userOptions = response.data.users
            .filter(user => !localEmails.has(user.email))
            .map(user => ({
              email: user.email,
              name: user.name,
              profile_photo_url: user.profile_photo_url,
            }));

          setOptions(userOptions);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [localData]);

  const toggleUser = (user) => {
    const isSelected = selectedUsers.some(u => u.email === user.email);
    const updated = isSelected
      ? selectedUsers.filter(u => u.email !== user.email)
      : [...selectedUsers, user];

    handleChange(updated);
  };

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;

    const searchLower = searchTerm.toLowerCase().trim();

    return options.filter(({ email, name }) => {
      const emailLower = email.toLowerCase();
      const nameLower = name.toLowerCase();

      return emailLower.includes(searchLower) || nameLower.includes(searchLower);
    });
  }, [options, searchTerm]);

  return (
    <section className="flex flex-col w-full gap-2">
      <Popover modal>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            className='w-full justify-start text-left rounded-full'
          >
            Seleccionar empleados
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-2">
          {isLoading && <p className="text-sm">Cargando...</p>}
          {error && <p className="text-sm text-red-500">Error al cargar emails</p>}

          {!isLoading && !error && (
            <div className="max-h-60 overflow-y-auto dark:dark-scrollbar">
              <Input
                type="search"
                placeholder="Buscar"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="sticky top-0 px-2 py-1 w-full"
              />
              {filteredOptions.map(user => {
                const isChecked = selectedUsers.some(u => u.email === user.email);

                return (
                  <label key={user.email} className="flex items-center gap-2 cursor-pointer px-2 py-1 hover:bg-muted rounded">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleUser(user)}
                      id={`check-${user.email}`}
                    />
                    <span className="text-sm">{user.name} ({user.email})</span>
                  </label>
                );
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUsers.map(user => (
            <div
              key={user.email}
              className="flex items-center rounded-full bg-custom-orange px-2 py-1 text-sm text-custom-white cursor-pointer"
              onClick={() => toggleUser(user)}
            >
              {user.name}
              <Icon name="Trash" size="16" className="ml-2" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


export default UserSelector;


