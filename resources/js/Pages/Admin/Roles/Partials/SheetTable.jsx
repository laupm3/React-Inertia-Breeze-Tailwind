import { SheetTable as SheetTableBase } from "@/Components/DataTable/SheetTable";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "@/Components/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { useEffect, useState } from "react";
import Icon from "@/imports/LucideIcon";
import { Alert } from "@/Components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import BlockCard from "@/Components/OwnUi/BlockCard";
import { Switch } from "@/Components/ui/switch";
import { Label } from "@/Components/ui/label";
import TextInput from "@/Components/OwnUi/TextInput";

export function SheetTable({ dataId, open, onOpenChange }) {
    const { t } = useTranslation(["datatable"]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showPermissions, setShowPermissions] = useState([]);

    const [role, setRole] = useState(null);
    const [modules, setModules] = useState(null);


    const [search, setSearch] = useState("");

    const filteredModules = modules?.filter(module =>
        module.name.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roleResponse, modulesResponse] = await Promise.all([
                    axios.get(route("api.v1.admin.roles.show", { id: dataId })),
                    axios.get(route("api.v1.admin.modules.index")),
                ]);

                if (roleResponse.status === 200) {
                    setRole(roleResponse.data.role);
                } else {
                    setError(true);
                }

                if (modulesResponse.status === 200) {
                    setModules(modulesResponse.data.modules);
                } else {
                    setError(true);
                }
            } catch (error) {
                setError(true);
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => { };
    }, [dataId]);

    const changePermission = async (roleId, permissionId) => {
        try {
            const response = await axios.put(route("api.v1.admin.roles.permission.switch", { role: roleId, permission: permissionId }));
            console.log('response :>> ', response.data.roleHasPermission);

            if (response.status === 200) {
                // Vuelve a obtener los datos del rol
                const roleResponse = await axios.get(route("api.v1.admin.roles.show", { id: roleId }));
                if (roleResponse.status === 200) {
                    setRole(roleResponse.data.role);
                } else {
                    setError(true);
                }
                return response.data.roleHasPermission;
            }
        } catch (error) {
            setError(true);
            console.error("Error changing permission:", error);
        }
    };

    const changeUsers = async (userId, roleId) => {
        try {
            const response = await axios.put(route("api.v1.admin.users.role.switch", { user: userId, role: roleId }));
            console.log('response :>> ', response.data);

            if (response.status === 200) {
                // Vuelve a obtener los datos del rol
                const roleResponse = await axios.get(route("api.v1.admin.roles.show", { id: roleId }));
                if (roleResponse.status === 200) {
                    setRole(roleResponse.data.role);
                } else {
                    setError(true);
                }
                return response.data.roleHasPermission;
            }
        } catch (error) {
            setError(true);
            console.error("Error changing permission:", error);
        }
    };

    return (
        <SheetTableBase
            title={
                <span className="text-custom-orange">
                    {role && role.name}
                </span>
            }
            open={open}
            onOpenChange={onOpenChange}
            className={"min-w-[600px] no-scrollbar"}
            descriptionContent={
                <>
                    <div className="text-custom-black dark:text-custom-white">
                        {/* description */}
                        {role && role.description &&
                            <div className="p-4 mb-4 rounded-xl bg-custom-gray-light dark:bg-custom-blackSemi">
                                {role.description}
                            </div>
                        }
                        {role && (
                            <Tabs defaultValue="permisos" className="w-auto">

                                <TabsList className="flex flex-col sm:flex-row items-center gap-4 mb-4 w-full">
                                    <TabsTrigger value="permisos" className="w-full">{t('tables.permisos')}</TabsTrigger>
                                    <TabsTrigger value="usuarios" className="w-full">{t('tables.usuarios')}</TabsTrigger>
                                </TabsList>

                                <TabsContent value="permisos">
                                    <TextInput
                                        type="text"
                                        placeholder="Buscar..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="ml-auto w-1/2"
                                    />
                                    <div className='max-h-[calc(100vh-350px)] overflow-y-auto dark:dark-scrollbar mt-4'>
                                        <BlockCard
                                            title={'Permisos'}
                                            marginLeft="ml-4"
                                            className="border-4 rounded-xl p-4 mb-6 text-custom-blackLight dark:text-custom-gray-default"
                                        >
                                            {filteredModules &&
                                                filteredModules.map((module) => {
                                                    const activePermissions = role?.permissions.filter(permission => module.permissions.some(modulePermission => modulePermission.id === permission.id)).length

                                                    return (
                                                        <div key={module.id} className="relative">
                                                            <div className='flex items-center justify-between space-y-4'>
                                                                <p>{module.name}</p>
                                                                <div className='flex items-center gap-2'>
                                                                    <p className='text-xs font-bold text-custom-orange'>{activePermissions} / {module.permissions.length}</p>
                                                                    <div
                                                                        className="flex items-center w-fit p-2 mr-2 rounded-lg bg-custom-gray-default dark:bg-custom-blackSemi hover:opacity-50 duration-300 cursor-pointer select-none"
                                                                        onClick={() => setShowPermissions(module.id === showPermissions ? null : module.id)}
                                                                    >
                                                                        editar permisos
                                                                        {showPermissions === module.id ? (
                                                                            <Icon name="ChevronUp" className="w-4 h-4 ml-2 text-custom-orange" />
                                                                        ) : (
                                                                            <Icon name="ChevronDown" className="w-4 h-4 ml-2" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {showPermissions === module.id && (
                                                                <div className="absolute mt-2 right-4 bg-white dark:bg-custom-blackSemi p-4 rounded-lg shadow-lg z-10">
                                                                    {module.permissions.map((permission) => {
                                                                        const hasThisPermission = role?.permissions?.some(rolePermission => rolePermission.id === permission.id);

                                                                        return (
                                                                            <div
                                                                                key={permission.id}
                                                                                className="flex items-center justify-between gap-2 space-y-4"
                                                                            >
                                                                                <Label
                                                                                    htmlFor={permission.name}
                                                                                    className="capitalize"
                                                                                >
                                                                                    {permission.name}
                                                                                </Label>
                                                                                <Switch
                                                                                    id={permission.name}
                                                                                    checked={hasThisPermission}
                                                                                    className={'data-[state=checked]:bg-custom-orange'}
                                                                                    onCheckedChange={() => changePermission(role.id, permission.id)}
                                                                                />
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            }
                                        </BlockCard>
                                    </div>
                                </TabsContent>

                                <TabsContent value="usuarios">
                                    <div className='dark:dark-scrollbar max-h-[calc(100vh-300px)] overflow-y-auto'>
                                        <BlockCard
                                            title={'Usuarios'}
                                            marginLeft="ml-4"
                                            className="border-4 rounded-xl p-4 mb-6 text-custom-blackLight dark:text-custom-gray-default"
                                        >
                                            {role?.users?.map((user) => (
                                                <div key={user.id} className='flex flex-row w-full items-center justify-start mb-4'>
                                                    <Avatar className="h-12 w-12 rounded-full">
                                                        {user?.profile_photo_url ? (
                                                            <AvatarImage
                                                                src={user?.profile_photo_url}
                                                                alt={user?.name}
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="rounded-lg">
                                                                {user?.name[0]}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>

                                                    <div className="flex flex-col ml-4">
                                                        <span className="text-sm">{user?.name}</span>
                                                        <span className="text-xs opacity-75">{user?.email}</span>
                                                    </div>

                                                    <div
                                                        onClick={() => changeUsers(user.id, role.id)}
                                                        className="ml-auto mr-4"
                                                    >
                                                        <Icon name='Trash' size='16' />
                                                    </div>
                                                </div>
                                            ))}
                                        </BlockCard>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}
                        {loading && !error && <LoadingSpinner />}
                        {error && (
                            <Alert variant={"destructive"}>
                                Error Fetching Data
                            </Alert>
                        )}
                    </div>
                </>
            }
        />
    );
}


