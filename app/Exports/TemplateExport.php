<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Font;

class TemplateExport implements FromArray, WithHeadings, WithStyles, WithColumnWidths
{
    /**
     * @var array
     */
    protected array $templateData;

    /**
     * Constructor
     *
     * @param array $templateData
     */
    public function __construct(array $templateData)
    {
        $this->templateData = $templateData;
    }

    /**
     * Return array of data for the template
     *
     * @return array
     */
    public function array(): array
    {
        // Primera fila: datos de ejemplo
        $exampleRow = $this->templateData['example_data'] ?? [];
        
        // Crear filas adicionales vacías para que el usuario pueda llenar
        $emptyRows = array_fill(0, 10, array_fill(0, count($this->templateData['headers']), ''));
        
        return array_merge([$exampleRow], $emptyRows);
    }

    /**
     * Return headings for the template
     *
     * @return array
     */
    public function headings(): array
    {
        return $this->templateData['headers'] ?? [];
    }

    /**
     * Apply styles to the worksheet
     *
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet): array
    {
        // Estilo para los encabezados (primera fila)
        $sheet->getStyle('1:1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['argb' => Color::COLOR_WHITE],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => '4472C4'], // Azul
            ],
        ]);

        // Estilo para la fila de ejemplo (segunda fila)
        $sheet->getStyle('2:2')->applyFromArray([
            'font' => [
                'italic' => true,
                'color' => ['argb' => '7C7C7C'], // Gris
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'F2F2F2'], // Gris claro
            ],
        ]);

        // Auto-ajustar el alto de las filas
        $sheet->getDefaultRowDimension()->setRowHeight(-1);
        
        // Congelar la primera fila
        $sheet->freezePane('A2');

        return [];
    }

    /**
     * Set column widths
     *
     * @return array
     */
    public function columnWidths(): array
    {
        $headers = $this->templateData['headers'] ?? [];
        $widths = [];
        
        foreach ($headers as $index => $header) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
            
            // Calcular ancho basado en la longitud del encabezado
            $width = max(15, min(50, strlen($header) * 1.2));
            $widths[$columnLetter] = $width;
        }
        
        return $widths;
    }
}
