<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IncidentComment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'incident_id',
        'created_by',
        'updated_by',
        'comment',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    const RELATIONSHIPS = ['incident', 'createdBy', 'updatedBy'];

    // Relaciones
    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeByIncident($query, $incidentId)
    {
        return $query->where('incident_id', $incidentId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Métodos de utilidad
    public function updateComment($userId, string $newComment): bool
    {
        return $this->update([
            'comment' => $newComment,
            'updated_by' => $userId,
        ]);
    }

    public function isEdited(): bool
    {
        return !is_null($this->updated_by);
    }
} 