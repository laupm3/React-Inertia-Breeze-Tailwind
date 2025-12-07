<?php

namespace App\Http\Requests\Export;

use Illuminate\Foundation\Http\FormRequest;

abstract class BaseExportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'filters' => ['nullable', 'array'],
            'filters.*' => ['nullable'],
            'selectedRows' => ['nullable', 'array'],
            'selectedRows.*' => ['nullable', 'integer'],
            'columnVisibility' => ['nullable', 'array'],
            'columnVisibility.*' => ['nullable', 'boolean'],
            'sorting' => ['nullable', 'array'],
            'sorting.*.id' => ['required_with:sorting', 'string'],
            'sorting.*.desc' => ['nullable', 'boolean'],
            'exportType' => ['nullable', 'string', 'in:all,selected,filtered'],
            'totalRows' => ['nullable', 'integer', 'min:0'],
            'hasManualSelection' => ['nullable', 'boolean'],
            'manualSelectionCount' => ['nullable', 'integer', 'min:0'],
            'sortedRowsCount' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * Get filters from request
     *
     * @return array
     */
    public function filters(): array
    {
        $filters = $this->input('filters', []);
        if (is_string($filters)) {
            $filters = json_decode($filters, true);
        }
        return is_array($filters) ? $filters : [];
    }

    /**
     * Get selected rows from request
     *
     * @return array
     */
    public function selectedRows(): array
    {
        $selected = $this->input('selectedRows', []);
        return is_array($selected) ? $selected : [];
    }

    /**
     * Get column visibility from request
     *
     * @return array
     */
    public function columnVisibility(): array
    {
        $visibility = $this->input('columnVisibility', []);
        return is_array($visibility) ? $visibility : [];
    }

    /**
     * Get sorting from request
     *
     * @return array
     */
    public function sorting(): array
    {
        $sorting = $this->input('sorting', []);
        return is_array($sorting) ? $sorting : [];
    }

    /**
     * Get export type from request
     *
     * @return string
     */
    public function exportType(): string
    {
        return $this->input('exportType', 'filtered');
    }

    /**
     * Get total rows from request
     *
     * @return int
     */
    public function totalRows(): int
    {
        return (int) $this->input('totalRows', 0);
    }

    /**
     * Get has manual selection from request
     *
     * @return bool
     */
    public function hasManualSelection(): bool
    {
        return (bool) $this->input('hasManualSelection', false);
    }

    /**
     * Get manual selection count from request
     *
     * @return int
     */
    public function manualSelectionCount(): int
    {
        return (int) $this->input('manualSelectionCount', 0);
    }

    /**
     * Get sorted rows count from request
     *
     * @return int
     */
    public function sortedRowsCount(): int
    {
        return (int) $this->input('sortedRowsCount', 0);
    }

    /**
     * Get validated data from the request.
     *
     * @param string|array|null $key
     * @param mixed $default
     * @return mixed
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);
        
        if ($key === null) {
            return [
                'filters' => $this->filters(),
                'selectedRows' => $this->selectedRows(),
                'columnVisibility' => $this->columnVisibility(),
                'sorting' => $this->sorting(),
                'exportType' => $this->exportType(),
                'totalRows' => $this->totalRows(),
                'hasManualSelection' => $this->hasManualSelection(),
                'manualSelectionCount' => $this->manualSelectionCount(),
                'sortedRowsCount' => $this->sortedRowsCount(),
            ];
        }
        
        return $validated;
    }
}