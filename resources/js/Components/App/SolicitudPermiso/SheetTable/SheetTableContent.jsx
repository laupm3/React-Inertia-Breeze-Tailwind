import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { CalendarDays, Clock, User, FileText, CheckCircle } from "lucide-react";

export default function SheetTableContent({ data }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        return timeString.slice(0, 5); // HH:mm
    };

    const getEstadoBadgeVariant = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'pendiente':
                return 'secondary';
            case 'aprobado':
                return 'success';
            case 'rechazado':
                return 'destructive';
            default:
                return 'default';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Solicitud de Permiso</h2>
                    <p className="text-muted-foreground">
                        Solicitud #{data.id} - {data.empleado?.nombre} {data.empleado?.apellidos}
                    </p>
                </div>
                <Badge variant={getEstadoBadgeVariant(data.estado?.nombre)}>
                    {data.estado?.nombre || 'Pendiente'}
                </Badge>
            </div>

            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Empleado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="font-medium">{data.empleado?.nombre} {data.empleado?.apellidos}</p>
                            <p className="text-sm text-muted-foreground">{data.empleado?.email}</p>
                            <p className="text-sm text-muted-foreground">
                                Departamento: {data.empleado?.departamento?.nombre || 'N/A'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Tipo de Permiso
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="font-medium">{data.permiso?.nombre || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">
                                {data.permiso?.descripcion || 'Sin descripción'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Fechas y tiempos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Fechas y Horarios
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">Fecha de inicio</p>
                            <p className="text-sm text-muted-foreground">{formatDate(data.fecha_inicio)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Fecha de fin</p>
                            <p className="text-sm text-muted-foreground">{formatDate(data.fecha_fin)}</p>
                        </div>
                        {!data.dia_completo && (
                            <>
                                <div>
                                    <p className="text-sm font-medium">Hora de inicio</p>
                                    <p className="text-sm text-muted-foreground">{formatTime(data.hora_inicio)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Hora de fin</p>
                                    <p className="text-sm text-muted-foreground">{formatTime(data.hora_fin)}</p>
                                </div>
                            </>
                        )}
                        <div>
                            <p className="text-sm font-medium">Día completo</p>
                            <p className="text-sm text-muted-foreground">
                                {data.dia_completo ? 'Sí' : 'No'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Recuperable</p>
                            <p className="text-sm text-muted-foreground">
                                {data.recuperable ? 'Sí' : 'No'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Motivo */}
            {data.motivo && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Motivo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{data.motivo}</p>
                    </CardContent>
                </Card>
            )}

            {/* Información adicional */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Información Adicional
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">Fecha de solicitud</p>
                            <p className="text-sm text-muted-foreground">{formatDate(data.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Última actualización</p>
                            <p className="text-sm text-muted-foreground">{formatDate(data.updated_at)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
