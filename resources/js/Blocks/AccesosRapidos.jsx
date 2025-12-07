import { useState, useEffect } from "react";

import { Button } from "@/Components/App/Buttons/Button";
import { router } from "@inertiajs/react";
import Icon from "@/imports/LucideIcon";

export default function AccesosRapidos() {
  const [shortcuts, setShortcuts] = useState({});

  useEffect(() => {
    const storedShortcuts = localStorage.getItem("shortcuts");
    if (storedShortcuts) {
      setShortcuts(JSON.parse(storedShortcuts));
    }
  }, []);

  const activeShortcuts = Object.entries(shortcuts).filter(
    ([, { enabled }]) => enabled
  );

  return (
    <div className="flex flex-col mb-4">
      <section className="flex items-center justify-between mb-4">
        <span className="flex items-center justify-center text-2xl font-bold text-custom-blue dark:text-custom-white">
          Accesos Rápidos
        </span>
        <Button
          variant="secondary"
          onClick={() => router.visit(route('profile.show') + '?tab=appearance')}
        >
          Settings <Icon name="Settings" size="16" className="ml-2" />
        </Button>
      </section>
      {activeShortcuts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 pr-7 mt-1 -mr-5 pb-7">
          {Object.entries(shortcuts).map(([key, { url, title, icon, enabled }], index) => (
            enabled && (
              <span
                key={index}
                onClick={() => router.visit(route(url))}
                className="relative flex h-20 items-center justify-center bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-semiLight hover:dark:bg-custom-blackLight p-2 rounded-2xl overflow-hidden cursor-pointer"
              >
                <span className="absolute top-2 left-4 text-lg font-bold text-custom-blue dark:text-custom-white">
                  {title}
                </span>

                <span className="absolute -bottom-4 -right-1 text-custom-orange -rotate-12">
                  <Icon name={icon} size="72" />
                </span>
              </span>
            )
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pr-7 mt-1 -mr-5 pb-7">
          <span
            onClick={() => router.visit(route('profile.show') + '?tab=appearance')}
            className="relative flex h-20 items-center justify-center bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-semiLight hover:dark:bg-custom-blackLight p-2 rounded-2xl overflow-hidden cursor-pointer"
          >
            <span className="absolute top-2 left-4 text-lg font-bold text-custom-blue dark:text-custom-white">
              Aún no tienes accesos rápidos configurados
            </span>

            <span className="absolute -bottom-4 -right-1 text-custom-orange -rotate-12">
              <Icon name='Settings' size="72" />
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

