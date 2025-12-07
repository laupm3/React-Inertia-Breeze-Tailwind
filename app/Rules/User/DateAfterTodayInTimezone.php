<?php

namespace App\Rules\User;

use Carbon\Carbon;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class DateAfterTodayInTimezone implements ValidationRule
{
    protected string $timezone;

    public function __construct(string $timezone)
    {
        $this->timezone = $timezone;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$value) return;

        $dateInTimezone = Carbon::parse($value)->setTimezone($this->timezone);
        $todayInTimezone = Carbon::now($this->timezone);

        if ($dateInTimezone->lt($todayInTimezone)) {
            $fail('La fecha y hora debe ser superior a la fecha y hora actual en su zona horaria.');
        }
    }
}
