import { useEffect, useState } from "react";
import axios from "axios";
import { SheetTable as SheetTableBase } from "@/Components/DataTable/SheetTable";
import SheetTablContent from "./SheetTableContent";
import SheetTableSkeleton from "./SheetTableSkeleton";
import useApiEndpoints from "../Hooks/useApiEndpoints";

export default function SheetTable({ open, onOpenChange, model, enableToView=true }) {
    const endpoints = useApiEndpoints(model);

    const [data, setData] = useState(null);
    const [allNavigationData, setAllNavigationData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Obtenemos tanto el link específico como todos los links para la jerarquía
                const [linkResponse, allLinksResponse] = await Promise.all([
                    axios.get(endpoints.show),
                    axios.get(route('api.v1.admin.navigation.index'))
                ]);
                
                if (linkResponse.status === 200) {
                    setData(linkResponse.data.link);
                }
                
                if (allLinksResponse.status === 200) {
                    // Aplanar la estructura de árbol para tener todos los links en un array
                    const flattenLinks = (links) => {
                        let flattened = [];
                        links.forEach(link => {
                            flattened.push(link);
                            if (link.children && link.children.length > 0) {
                                flattened = flattened.concat(flattenLinks(link.children));
                            }
                        });
                        return flattened;
                    };
                    
                    setAllNavigationData(flattenLinks(allLinksResponse.data.links));
                } else {
                    setError(true);
                }
            } catch (error) {
                setError(true);
                console.error('Error fetching navigation data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (model && open && endpoints.show) {
            fetchData();
        }
        return () => { };
    }, [model, open, endpoints.show]);

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
                            <SheetTablContent 
                                data={data} 
                                allNavigationData={allNavigationData} 
                            />
                        </>
                    )}
                </>
            }
        />
    );
}