import { useEffect, useState } from "react";
import { SheetTable as SheetTableBase } from "@/Components/DataTable/SheetTable";
import SheetTableContent from "./SheetTableContent";
import SheetTableSkeleton from "./SheetTableSkeleton";
import useApiEndpoints from "../Hooks/useApiEndpoints";
import SheetTableError from "./SheetTableError";

export default function SheetTable({ open, onOpenChange, model, enableToView = true }) {
    const endpoints = useApiEndpoints(model);

    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(endpoints.show);
                setData(response.data.asignacion);
            } catch (error) {
                setError(true);
                console.log('error :>> ', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => { };
    }, [model]);

    return (
        <SheetTableBase
            title={null}
            open={open}
            onOpenChange={onOpenChange}
            className={"w-full max-w-full sm:min-w-[600px]"}
            descriptionContent={
                <>
                    {(isLoading || !enableToView) ? (
                        <div className="flex items-center justify-center w-full h-full mt-6">
                            <SheetTableSkeleton />
                        </div>
                    ) : (
                        error ? (
                            <SheetTableError />
                        ) : (
                            <>
                                {/* contenido del sheet */}
                                <SheetTableContent data={data} />
                            </>
                        )
                    )}
                </>
            }
        />
    );
}