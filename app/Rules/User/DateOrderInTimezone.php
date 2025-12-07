<?php

namespace App\Rules\User;

use Carbon\Carbon;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class DateOrderInTimezone implements ValidationRule
{
    protected ?string $compareDate;
    protected string $timezone;
    protected string $comparison;

    public function __construct(?string $compareDate, string $timezone, string $comparison = 'before_or_equal')
    {
        $this->compareDate = $compareDate;
        $this->timezone = $timezone;
        $this->comparison = $comparison;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$value || !$this->compareDate) return;

        $date = Carbon::parse($value)->setTimezone($this->timezone);
        $compareDate = Carbon::parse($this->compareDate)->setTimezone($this->timezone);

        $isValid = match($this->comparison) {
            'before_or_equal' => $date->lte($compareDate),
            'after_or_equal' => $date->gte($compareDate),
            default => false
        };

        if (!$isValid) {
            $message = $this->comparison === 'before_or_equal' 
                ? 'La fecha inicial debe ser anterior o igual a la fecha final.'
                : 'La fecha final debe ser posterior o igual a la fecha inicial.';
            
            $fail($message);
        }
    }
}