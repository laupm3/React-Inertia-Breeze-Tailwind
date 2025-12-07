import UserAvatar from "@/Components/App/User/UserAvatar";

/**
 * Componente para mostrar el estado de aprobación con pill de color
 */
function ApprovalStatusPill({ aprobacion }) {
    if (!aprobacion || !aprobacion.approvedBy) {
        return <span className="text-gray-400 text-sm">-</span>;
    }

    const isApproved = aprobacion.aprobado;
    const approver = aprobacion.approvedBy;

    // Normalizar los datos del aprobador para que funcionen con UserAvatar
    const normalizedApprover = {
        name: approver.empleado?.nombreCompleto || approver.name || 'Usuario',
        profile_photo_url: approver.empleado?.user?.profile_photo_url || approver.profile_photo_url
    };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isApproved 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
        }`}>     
            <UserAvatar 
                user={normalizedApprover}
                showName={false}
                size="w-6 h-6"
                className=""
            />
            <span className="truncate max-w-[100px]">
                {normalizedApprover.name}
            </span>
        </div>
    );
}

export default ApprovalStatusPill;
