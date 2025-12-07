import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button"
import EventDialog from "@/Components/OwnUi/EventDialog";
import { AlertDialogAction, AlertDialogCancel } from "@/Components/ui/alert-dialog";
import { PlusIcon } from "lucide-react";

export default function Index({ provincias }) {

    const handleDelete = (provincia) => {

        router.delete(route('provincias.destroy', { provincia: provincia.id }), {
            preserveScroll: true
        });
    };

    return (
        <>
            <Head title="Manage Provincias" />

            {/* Botón para agregar un nuevo idioma */}
            <Link href={route('provincias.create')} className="inline-flex btn btn-primary mb-4 gap-2 bg-secondary px-3 py-2 rounded-md mt-2 mx-auto ms-2">
                <PlusIcon className="text-green-500" />
                <span className="">Add New Provincia</span>
            </Link>

            {/* Tabla de idiomas */}
            <div className="flex justify-between items-center mt-4 space-x-2 px-2 text-center">
                <Table className="w-full border-collapse shadow-lg rounded-lg">
                    <TableCaption>Listado de provincias soportadas</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] text-center">Name</TableHead>
                            <TableHead className="text-center">Comunidad Autónoma</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {provincias.map((provincia) => (
                            <TableRow key={provincia.id}>
                                <TableCell className="font-medium">{provincia.nombre}</TableCell>
                                <TableCell>{provincia.comunidad?.nombre}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center items-center gap-3">
                                        <Link href={route('provincias.edit', provincia.id)} className="text-yellow-400">
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
                                                    onClick={() => handleDelete(provincia)}
                                                    className="bg-red-500 hover:bg-red-700 text-primary-100"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            }
                                            cancel={<AlertDialogCancel>Cancel</AlertDialogCancel>}
                                        >
                                            This action cannot be undone. This will permanently delete the provincia.
                                        </EventDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;