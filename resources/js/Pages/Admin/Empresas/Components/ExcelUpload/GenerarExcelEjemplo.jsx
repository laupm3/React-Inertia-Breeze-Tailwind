import GenerarPlantillaImport from "@/Components/Import/GenerarPlantillaImport";

export default function GenerarExcelEjemplo() {
    return (
        <GenerarPlantillaImport 
            entity="empresas" 
            displayName="Empresas"
            format="xlsx"
        />
    );
}
