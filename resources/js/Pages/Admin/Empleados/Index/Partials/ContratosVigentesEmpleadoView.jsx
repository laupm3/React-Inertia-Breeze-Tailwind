import { useView } from "../Context/ViewContext";
import ContratosVigentesDialog from "@/Components/App/Empleado/ContratosVigentesDialog/ContratosVigentesDialog";

export default function ContratosVigentesEmpleadoView() {

    const { empleadoContratosVigentesView, handleContratosVigentesView } = useView();

    const { empleado, open } = empleadoContratosVigentesView;
    
    if (!empleado) {
        return null;
    }

    return (
        <ContratosVigentesDialog
            open={open}
            onOpenChange={() => handleContratosVigentesView(empleado)}
            model={empleado}
        />
    );
}