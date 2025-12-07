import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Calendar, Clock, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ScheduledBanIndex() {
    const { users, flash } = usePage().props;
    const [selectedUser, setSelectedUser] = useState(null);

    const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
        user_id: '',
        scheduled_date: '',
        reason: '',
    });

    // Mostrar mensajes flash
    React.useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Agregar esta función al inicio del componente
    /* const formatDateForBackend = (datetimeLocal) => {
        console.log('Input para formatear:', datetimeLocal);

        if (!datetimeLocal) {
            console.error('Fecha vacía');
            return '';
        }

        // Si viene como "2025-06-11T14:29", convertir a "2025-06-11 14:29:00"
        let formatted = datetimeLocal;

        // Reemplazar T por espacio si existe
        if (formatted.includes('T')) {
            formatted = formatted.replace('T', ' ');
        }

        // Agregar segundos si no los tiene
        if (formatted.length === 16) { // "2025-06-11 14:29"
            formatted += ':00';
        }

        console.log('Fecha formateada:', formatted);
        return formatted;
    }; */

    const handleSubmit = (e) => {
        e.preventDefault();
    
        console.log('=== DEBUG FRONTEND ===');
        console.log('Fecha original:', data.scheduled_date);
    
        // Enviar directamente sin formatear
        post(route('admin.scheduled-bans.store'), {
            preserveScroll: true,
            onSuccess: (response) => {
                console.log('Éxito:', response);
                reset();
                setSelectedUser(null);
            },
            onError: (errors) => {
                console.error('Errores:', errors);
            }
        });
    };

    const cancelScheduledBan = (userId) => {
        if (confirm('¿Estás seguro de que quieres cancelar este baneo programado?')) {
            destroy(route('admin.scheduled-bans.destroy', userId));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Obtener fecha mínima (ahora + 1 minuto)
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1);
        return now.toISOString().slice(0, 16);
    };

    const usersWithScheduledBans = users.filter(user => user.scheduled_status_change_at && user.next_status === 4);

    return (
        <AuthenticatedLayout>
            <Head title="Programar Baneos" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Formulario para programar baneo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Programar Baneo de Usuario
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="user_id">Usuario a banear</Label>
                                    <Select
                                        value={data.user_id}
                                        onValueChange={(value) => {
                                            setData('user_id', value);
                                            setSelectedUser(users.find(u => u.id == value));
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un usuario" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{user.name} - {user.email}</span>
                                                        <Badge variant="outline" className="ml-2">
                                                            {user.status_label}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && <p className="text-red-500 text-sm mt-1">{errors.user_id}</p>}
                                </div>

                                {selectedUser && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="w-4 h-4" />
                                            <span className="font-medium">Usuario seleccionado:</span>
                                        </div>
                                        <p className="text-sm">{selectedUser.name} ({selectedUser.email})</p>
                                        <Badge variant="outline" className="mt-1">
                                            {selectedUser.status_label}
                                        </Badge>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="scheduled_date">Fecha y hora programada</Label>
                                    <Input
                                        id="scheduled_date"
                                        type="datetime-local"
                                        value={data.scheduled_date}
                                        onChange={(e) => {
                                            console.log('Cambio en input datetime:', e.target.value);
                                            setData('scheduled_date', e.target.value);
                                        }}
                                        min={getMinDateTime()}
                                        className="mt-1"
                                    />
                                    {errors.scheduled_date && <p className="text-red-500 text-sm mt-1">{errors.scheduled_date}</p>}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Ejemplo: Para 10 días y 2 horas desde ahora
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="reason">Motivo del baneo</Label>
                                    <Textarea
                                        id="reason"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder="Describe el motivo del baneo programado..."
                                        className="mt-1"
                                        rows={4}
                                    />
                                    {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing ? 'Programando...' : 'Programar Baneo'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Lista de baneos programados */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Baneos Programados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {usersWithScheduledBans.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    No hay baneos programados actualmente
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {usersWithScheduledBans.map((user) => (
                                        <div key={user.id} className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                                                        <span className="font-medium">{user.name}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                        {user.email}
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-medium">Programado para:</span>{' '}
                                                        {formatDate(user.scheduled_status_change_at)}
                                                    </p>
                                                    {user.scheduled_ban_reason && (
                                                        <p className="text-sm mt-2">
                                                            <span className="font-medium">Motivo:</span>{' '}
                                                            {user.scheduled_ban_reason}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => cancelScheduledBan(user.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}