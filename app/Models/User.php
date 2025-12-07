<?php

namespace App\Models;

use App\Contracts\HasCustomProfilePhoto;
use App\Enums\UserStatus;
use Laravel\Jetstream\HasTeams;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Jetstream\HasProfilePhoto;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\Access\Authorizable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    //use Authorizable;
    use HasRoles;
    use HasApiTokens;
    use HasFactory;
    use HasProfilePhoto;
    use HasCustomProfilePhoto;
    use HasTeams;
    use Notifiable;
    use TwoFactorAuthenticatable;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'empleado_id',
        'descripcion',
        'status',
    ];

    /**
     * Default relationships to load when retrieving the model.
     *
     * @var array<string>
     */
    public const RELATIONSHIPS = [
        'roles',
        'empleado',
        'empleado.user',
        'empleado.contratos.centro',
        'empleado.contratos.departamento',
        'empleado.asignaciones',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
        'profile_photo_path',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
        ];
    }

    /**
     * Get the employee record associated with the user.
     */
    public function empleado()
    {
        return $this->belongsTo(Empleado::class);
    }

    /**
     * The events that the user is attending.
     */
    public function eventos()
    {
        return $this->belongsToMany(Evento::class, 'evento_user');
    }

    /**
     * The notifications that belong to the user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'receiver_id');
    }

    /**
     * The notifications that the user has sent.
     */

    public function sentNotifications()
    {
        return $this->hasMany(Notification::class, 'sender_id');
    }

    /**
     * Get notifications received by this user.
     */
    public function receivedNotifications()
    {
        return $this->hasMany(Notification::class, 'receiver_id');
    }

    /**
     * Get the latest 10 notifications received by the user.
     */
    public function latestNotifications()
    {
        return $this->notifications()
            ->with(['sender'])
            ->latest()
            ->limit(10)
            ->get();
    }

    /**
     * Obtener el nombre del canal de transmisión privado para el usuario.
     * Para que el usuario reciba notificaciones de eventos en tiempo real.
     *
     * @return string
     */
    public function receivesBroadcastNotificationsOn()
    {
        return 'App.Models.User.' . $this->id;
    }

    /**
     * Check if the user has a permission, revoking it if it does, or giving it if it doesn't.
     *
     * @return bool False if the permission was revoked, true if it was given.
     */
    public function togglePermission(Permission $permission): bool
    {
        $userHasPermission = $this->hasDirectPermission($permission);

        if ($userHasPermission) {
            $this->revokePermissionTo($permission);
        } else {
            $this->givePermissionTo($permission);
        }

        return !$userHasPermission;
    }

    /**
     * Check if the user has a role, revoking it if it does, or giving it if it doesn't.
     *
     * @return bool False if the role was revoked, true if it was given.
     */
    public function toggleRole(Role $role)
    {
        $userHasRole = $this->hasRole($role);

        if ($userHasRole) {
            $this->removeRole($role);
        } else {
            $this->assignRole($role);
        }

        return !$userHasRole;
    }
}
