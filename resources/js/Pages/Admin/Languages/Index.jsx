import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Head, Link, router } from "@inertiajs/react";
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import EventDialog from "@/Components/OwnUi/EventDialog";
import { AlertDialogAction, AlertDialogCancel } from "@/Components/ui/alert-dialog";
import { PlusIcon } from "lucide-react";

export default function Index({ languages }) {

    const handleDelete = (language) => {

        router.delete(route('languages.destroy', { language: language.id }), {
            preserveScroll: true
        });
    };

    return (
        <div
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Administración de Lenguajes
                </h2>
            }
        >
            <Head title="Manage Languages" />

            {/* Botón para agregar un nuevo idioma */}
            <Link href={route('languages.create')} className="inline-flex btn btn-primary mb-4 gap-2 bg-secondary px-3 py-2 rounded-md mt-2 mx-auto ms-2">
                <PlusIcon className="text-green-500" /> 
                <span className="">Add New Language</span>
            </Link>

            {/* Tabla de idiomas */}
            <div className="flex justify-between items-center mt-4 space-x-2 px-2 text-center">
                <Table className="w-full border-collapse shadow-lg rounded-lg">
                    <TableCaption>Listado de lenguajes soportados</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] text-center">Name</TableHead>
                            <TableHead className="text-center">Locale</TableHead>
                            <TableHead className="text-center">Region</TableHead>
                            <TableHead className="text-center">Cultural Conf.</TableHead>
                            <TableHead className="text-center">Default</TableHead>
                            <TableHead className="text-center">Active</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {languages.map((language) => (
                            <TableRow key={language.id}>
                                <TableCell className="font-medium">{language.name}</TableCell>
                                <TableCell>{language.locale}</TableCell>
                                <TableCell>{language.region || 'N/A'}</TableCell>
                                <TableCell>{language.cultural_configuration || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant={language.is_default ? 'outline' : 'secondary'}>
                                        {language.is_default ? 'Yes' : 'No'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={language.is_active ? 'outline' : 'secondary'}>
                                        {language.is_active ? 'Yes' : 'No'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center items-center gap-3">
                                        <Link href={route('languages.edit', language.id)} className="text-yellow-400">
                                            Edit
                                        </Link>

                                        <EventDialog
                                            trigger={
                                                <Button variant="danger" className="text-red-500 hover:text-red-700 hover:underline">
                                                    Delete
                                                </Button>
                                            }
                                            title="Are you absolutely sure?"
                                            action={
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(language)}
                                                    className="bg-red-500 hover:bg-red-700 text-primary-100"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            }
                                            cancel={<AlertDialogCancel>Cancel</AlertDialogCancel>}
                                        >
                                            This action cannot be undone. This will permanently delete the language.
                                        </EventDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;