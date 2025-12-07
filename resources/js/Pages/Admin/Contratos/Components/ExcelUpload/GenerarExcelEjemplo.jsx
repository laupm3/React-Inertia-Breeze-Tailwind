import GenerarPlantillaImport from "@/Components/Import/GenerarPlantillaImport";

export default function GenerarExcelEjemplo() {
    return (
        <GenerarPlantillaImport 
            entity="contratos" 
            displayName="Contratos"
            format="xlsx"
        />
    );
}
