import { useEffect, useState } from "react";
import { SheetTable as SheetTableBase } from "@/Components/DataTable/SheetTable";
import SheetTablContent from "./SheetTableContent";
import SheetTableSkeleton from "./SheetTableSkeleton";
import useApiEndpoints from "../Hooks/useApiEndpoints";

export default function SheetTable({ open, onOpenChange, model, enableToView=true }) {
    const endpoints = useApiEndpoints(model);

    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(endpoints.show);
                if (response.status === 200) {
                    setData(response.data.centro);
                } else {
                    setError(true);
                }
            } catch (error) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => { };
    }, [model]);

    if (isLoading || !enableToView) {
        return (
            <SheetTableBase
                title={null}
                open={open}
                onOpenChange={onOpenChange}
                className={"w-full max-w-full sm:min-w-[600px]"}
                descriptionContent={
                    <div className="flex items-center justify-center w-full h-full mt-6">
                        <SheetTableSkeleton />
                    </div>
                }
            />
        );
    }

    return (
        <SheetTableBase
            title={null}
            open={open}
            onOpenChange={onOpenChange}
            className={"w-full max-w-full sm:min-w-[600px]"}
            descriptionContent={
                <>
                    {data && (
                        <>
                            {/* contenido del sheet */}
                            <SheetTablContent data={data} />
                        </>
                    )}
                </>
            }
        />
    );
}