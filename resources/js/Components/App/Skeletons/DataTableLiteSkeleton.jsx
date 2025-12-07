import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Skeleton } from "@/Components/ui/skeleton";

/**
 * Skeleton de un componente datatable que acepta n cantidad de filas y columnas de forma dinámica
 * 
 * @param {Object} props - Propiedades del componente
 * @param {number} props.rows - Número de filas a mostrar en la tabla
 * @param {number} props.columns - Número de columnas a mostrar en la tabla 
 * @returns {JSX.Element} Tabla con esqueleto de carga
 */
export default function DataTableLiteSkeleton({ rows = 5, columns = 4 }) {
    return (
        <div className={'flex flex-col w-full'}>
            <div className={`flex flex-row items-center justify-start w-fit mb-[-15px] ml-[25px] px-2 bg-custom-white dark:bg-custom-blackLight z-0`}>
                <Skeleton className="h-6 w-40" />
            </div>
            <div className={'rounded-3xl p-4 md:p-6 w-full h-full mb-4 border-4 md:border-4 border-custom-gray-default dark:border-custom-blackSemi space-y-4 md:space-y-6 overflow-auto'}>
                <div className="space-y-4">
                    {/* Toolbar Skeleton */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-custom-white dark:bg-custom-blackLight shadow-sm">
                        <Skeleton className="h-8 w-24" /> {/* Título */}
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-8 w-24" /> {/* Filtros */}
                            <Skeleton className="h-8 w-40" /> {/* Input de búsqueda */}
                        </div>
                    </div>
                    {/* Table Skeleton */}
                    <div className="flex items-center py-1 justify-between border rounded-lg bg-custom-white dark:bg-custom-blackLight shadow-sm">
                        <Table className="w-full dark:border-custom-gray-dark bg-custom-white dark:bg-custom-blackLight">
                            <TableHeader>
                                <TableRow>
                                    {Array.from({ length: columns }).map((_, index) => (
                                        <TableHead key={index}>
                                            <Skeleton className="h-4 w-24" />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: rows }).map((_, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {Array.from({ length: columns }).map((_, colIndex) => (
                                            <TableCell key={colIndex} className="h-20">
                                                <Skeleton className="h-4 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div >
            </div>
        </div>

    );
}
