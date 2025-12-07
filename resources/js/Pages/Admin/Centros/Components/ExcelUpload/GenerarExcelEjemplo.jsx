import GenerarPlantillaImport from "@/Components/Import/GenerarPlantillaImport";

export default function GenerarExcelEjemplo() {
    return (
        <GenerarPlantillaImport 
            entity="centros" 
            displayName="Centros"
            format="xlsx"
        />
    );
}
