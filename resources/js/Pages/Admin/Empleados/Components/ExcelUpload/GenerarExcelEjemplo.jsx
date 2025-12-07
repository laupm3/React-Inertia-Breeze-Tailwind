import GenerarPlantillaImport from "@/Components/Import/GenerarPlantillaImport";

export default function GenerarExcelEjemplo() {
    return (
        <GenerarPlantillaImport 
            entity="empleados" 
            displayName="Empleados"
            format="xlsx"
        />
    );
} 