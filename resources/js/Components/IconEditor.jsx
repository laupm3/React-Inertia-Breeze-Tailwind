import { useState } from "react";
import {
    Smile,
    Swords,
    Banana,
    Beef,
    Bone,
    HandMetal,
    Brush,
    Coffee,
    ChartBar,
    Send,
    Zap,
    Rocket,
    House,
    Cookie,
    CodeXml,
    Box,
    Clapperboard,
    Backpack,
    Webhook,
    Lightbulb,
    Flame,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./App/Buttons/Button";

function IconEditor({ team, data, setData, permissions }) {
    const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
    const { canUpdateTeam } = permissions;

    const { t } = useTranslation("teams");

    const icons = {
        Smile,
        Swords,
        Banana,
        Beef,
        Bone,
        HandMetal,
        Brush,
        Coffee,
        ChartBar,
        Send,
        Zap,
        Rocket,
        House,
        Cookie,
        CodeXml,
        Box,
        Clapperboard,
        Backpack,
        Webhook,
        Lightbulb,
        Flame,
    };

    const IconComponent = icons[data.icon] || Rocket;

    return (
        <div className="flex lg:flex-row lg:gap-8 justify-center items-center">
            {/* Vista previa del icono */}
            <div className="flex flex-col items-center mr-5 lg:mr-0">
                <div
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: data.bg_color }}
                >
                    <IconComponent
                        className="w-12 h-12 sm:w-14 sm:h-14"
                        style={{ color: data.icon_color }}
                    />
                </div>
            </div>
            {(canUpdateTeam || !team) && (
                <>
                    <div className="flex lg:flex-row flex-col">
                        {/* Selector de iconos */}
                        <div className="lg:hidden flex flex-row items-center gap-2">
                            <span className="text-custom-blackLight dark:text-custom-white font-bold text-nowrap">
                                {t("Teams.selectIcon")}
                            </span>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    setIsIconSelectorOpen(!isIconSelectorOpen)
                                }
                                className="w-12 h-12 rounded-full p-1"
                            >
                                <IconComponent className="w-5 h-5" />
                            </Button>

                            {isIconSelectorOpen && (
                                <div className="relative">
                                    <div className="absolute z-50 w-52 right-10 top-8 bg-custom-white dark:bg-custom-blackLight rounded-lg shadow-lg p-2">
                                        <div className="grid grid-cols-6 gap-1">
                                            {Object.entries(icons).map(
                                                ([name, Icon]) => (
                                                    <Button
                                                        variant={"ghost"}
                                                        key={name}
                                                        type="button"
                                                        onClick={() => {
                                                            setData(
                                                                "icon",
                                                                name
                                                            );
                                                            setIsIconSelectorOpen(
                                                                false
                                                            );
                                                        }}
                                                        className="p-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                data.icon ===
                                                                name
                                                                    ? "#DBDBDB"
                                                                    : "transparent",
                                                            color:
                                                                data.icon ===
                                                                name
                                                                    ? "#212529"
                                                                    : "currentColor",
                                                            aspectRatio: 1,
                                                        }}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="hidden lg:grid lg:grid-cols-7 grid-col-3 lg:gap-8 overflow-x-visible mr-14">
                            {Object.entries(icons).map(([name, Icon]) => (
                                <Button
                                    variant={"ghost"}
                                    key={name}
                                    type="button"
                                    onClick={() => setData("icon", name)}
                                    className="p-2 rounded-full transition-all"
                                    style={{
                                        backgroundColor:
                                            data.icon === name
                                                ? "#DBDBDB"
                                                : "transparent",
                                        color:
                                            data.icon === name
                                                ? "#212529"
                                                : "currentColor",
                                        aspectRatio: 1,
                                    }}
                                >
                                    <Icon className="w-6 h-6 flex-shrink-0" />
                                </Button>
                            ))}
                        </div>

                        <div className="flex flex-row lg:flex-col justify-center gap-6 lg:gap-4">
                            {/* Color de fondo */}
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-xs md:text-sm text-center text-custom-gray-dark dark:text-custom-gray-light whitespace-nowrap">
                                    {t("Teams.background")}
                                </p>
                                <input
                                    type="color"
                                    value={data.bg_color}
                                    onChange={(e) =>
                                        setData("bg_color", e.target.value)
                                    }
                                    className="w-12 h-12 rounded cursor-pointer border border-custom-gray-light dark:border-custom-gray-darker"
                                />
                            </div>
                            {/* Color de icono */}
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-xs md:text-sm text-center text-custom-gray-dark dark:text-custom-gray-light whitespace-nowrap">
                                    {t("Teams.icon")}
                                </p>
                                <input
                                    type="color"
                                    value={data.icon_color}
                                    onChange={(e) =>
                                        setData("icon_color", e.target.value)
                                    }
                                    className="w-12 h-12 rounded cursor-pointer border border-custom-gray-light dark:border-custom-gray-darker"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default IconEditor;
