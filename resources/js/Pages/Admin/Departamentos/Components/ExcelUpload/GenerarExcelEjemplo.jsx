import GenerarPlantillaImport from "@/Components/Import/GenerarPlantillaImport";

export default function GenerarExcelEjemplo() {
    return (
        <GenerarPlantillaImport 
            entity="departamentos" 
            displayName="Departamentos"
            format="xlsx"
        />
    );
}
