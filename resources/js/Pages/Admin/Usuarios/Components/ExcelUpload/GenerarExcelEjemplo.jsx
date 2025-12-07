import GenerarPlantillaImport from "@/Components/Import/GenerarPlantillaImport";

export default function GenerarExcelEjemplo() {
    return (
        <GenerarPlantillaImport
            entity="usuarios"
            displayName="Usuarios"
            format="xlsx"
        />
    );
}
