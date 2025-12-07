import GenerarPlantillaImport from "@/Components/Import/GenerarPlantillaImport";

export default function GenerarExcelEjemplo() {
    return (
        <GenerarPlantillaImport 
            entity="asignaciones" 
            displayName="Asignaciones"
            format="xlsx"
        />
    );
}
