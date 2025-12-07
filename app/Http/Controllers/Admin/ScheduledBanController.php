<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Jobs\ScheduledBanUserJob;
use App\Services\User\UserStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;

class ScheduledBanController extends Controller
{
    public function __construct(private UserStatusService $userStatusService) {}

    /**
     * Mostrar la vista para programar baneos
     */
    public function index()
    {
        return Inertia::render('Admin/ScheduledBan/Index', [
            'users' => User::select('id', 'name', 'email', 'status', 'next_status', 'scheduled_status_change_at', 'scheduled_ban_reason')
                ->where('status', '!=', 4)
                ->orderBy('name')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'status' => $user->status,
                        'status_label' => $this->userStatusService->getStatusLabel($user->status),
                        'next_status' => $user->next_status,
                        'scheduled_status_change_at' => $user->scheduled_status_change_at,
                        'scheduled_ban_reason' => $user->scheduled_ban_reason,
                    ];
                })
        ]);
    }

    /**
     * Programar un baneo
     */
    public function store(Request $request)
    {
        Log::info("=== DEBUG REQUEST ===", [
            'scheduled_date' => $request->scheduled_date,
            'app_timezone' => config('app.timezone'),
            'current_time' => now()->toDateTimeString(),
        ]);

        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'scheduled_date' => 'required|string',
                'reason' => 'required|string|max:500',
            ]);

            $user = User::findOrFail($validated['user_id']);

            // Usar Carbon::parse que maneja múltiples formatos automáticamente
            $scheduledAt = Carbon::parse($validated['scheduled_date'], config('app.timezone'));

            Log::info("=== FECHA PARSEADA ===", [
                'input' => $validated['scheduled_date'],
                'parsed' => $scheduledAt->toDateTimeString(),
                'timezone' => $scheduledAt->timezone->getName(),
                'is_future' => $scheduledAt->isFuture(),
                'diff_minutes' => $scheduledAt->diffInMinutes(now()),
            ]);

            // Verificar que sea futura
            if ($scheduledAt->isPast()) {
                return back()->with('error', 'La fecha debe ser futura.');
            }

            // Verificar que el usuario no esté baneado
            if ($user->status === 4) {
                return back()->with('error', 'El usuario ya está baneado.');
            }

            Log::info("=== PROGRAMANDO JOB ===", [
                'scheduled_date' => $scheduledAt->toDateTimeString(),
                'current_time' => now()->toDateTimeString(),
                'delay_seconds' => $scheduledAt->diffInSeconds(now()),
                'user_id' => $user->id,
            ]);

            // Programar el job para la fecha real seleccionada
            ScheduledBanUserJob::dispatch(
                $user,
                $validated['reason'],
                Auth::id()
            )->delay($scheduledAt);

            // Actualizar usuario
            $user->update([
                'next_status' => 4,
                'scheduled_status_change_at' => $scheduledAt,
                'scheduled_ban_reason' => $validated['reason']
            ]);

            Log::info("=== USUARIO ACTUALIZADO ===", [
                'user_id' => $user->id,
                'next_status' => $user->next_status,
                'scheduled_at' => $user->scheduled_status_change_at,
            ]);

            return back()->with('success', "Baneo programado para {$user->name} el {$scheduledAt->format('d/m/Y H:i')}");

        } catch (\Exception $e) {
            Log::error("=== ERROR ===", [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Cancelar un baneo programado
     */
    public function destroy(User $user)
    {
        try {
            if (!$user->scheduled_status_change_at || $user->next_status !== 4) {
                return redirect()->back()->with('error', 'Este usuario no tiene un baneo programado.');
            }

            $user->update([
                'next_status' => null,
                'scheduled_status_change_at' => null,
                'scheduled_ban_reason' => null
            ]);

            Log::info("Baneo programado cancelado para usuario {$user->id}", [
                'cancelled_by' => Auth::id()
            ]);

            return redirect()->back()->with('success', "Baneo programado cancelado para {$user->name}");
        } catch (\Exception $e) {
            Log::error("Error cancelando baneo programado: " . $e->getMessage());
            return redirect()->back()->with('error', 'Error al cancelar el baneo programado.');
        }
    }
}
