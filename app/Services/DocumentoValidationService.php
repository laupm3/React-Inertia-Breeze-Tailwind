<?php

namespace App\Services;

use App\Models\TipoDocumento;

class DocumentoValidationService
{
    /**
     * Valida un documento de forma inteligente
     * @param string $documento Número de documento
     * @param int|string|TipoDocumento $tipoDocumento ID, nombre o instancia del tipo de documento
     * @return bool
     */
    public function validateDocumento($documento, $tipoDocumento): bool
    {
        $tipoDocumentoModel = $this->getTipoDocumento($tipoDocumento);
        
        if (!$tipoDocumentoModel || !$tipoDocumentoModel->regex) {
            return false;
        }
        
        return preg_match($tipoDocumentoModel->regex, $documento);
    }
    
    /**
     * Obtiene el tipo de documento según el parámetro recibido
     * @param int|string|TipoDocumento $tipoDocumento
     * @return TipoDocumento|null
     */
    protected function getTipoDocumento($tipoDocumento): ?TipoDocumento
    {
        // Si ya es una instancia de TipoDocumento
        if ($tipoDocumento instanceof TipoDocumento) {
            return $tipoDocumento;
        }
        
        // Si es un entero (ID)
        if (is_int($tipoDocumento) || is_numeric($tipoDocumento)) {
            return TipoDocumento::find((int) $tipoDocumento);
        }
        
        // Si es un string (nombre)
        if (is_string($tipoDocumento)) {
            return TipoDocumento::where('nombre', $tipoDocumento)->first();
        }
        
        return null;
    }
    
    /**
     * Obtiene el mensaje de error personalizado para un tipo de documento
     * @param int|string|TipoDocumento $tipoDocumento ID, nombre o instancia del tipo de documento
     * @return string
     */
    public function getErrorMessage($tipoDocumento): string
    {
        $tipoDocumentoModel = $this->getTipoDocumento($tipoDocumento);
        
        if (!$tipoDocumentoModel) {
            return 'Tipo de documento no válido.';
        }
        
        return "El formato del {$tipoDocumentoModel->nombre} no es válido. {$tipoDocumentoModel->descripcion}";
    }
    
    /**
     * Valida múltiples documentos
     * @param array $documentos Array con estructura ['numero' => string, 'tipo' => int|string|TipoDocumento]
     * @return array
     */
    public function validateMultipleDocumentos(array $documentos): array
    {
        $results = [];
        
        foreach ($documentos as $documento) {
            $results[] = [
                'documento' => $documento['numero'],
                'tipo' => $documento['tipo'],
                'is_valid' => $this->validateDocumento($documento['numero'], $documento['tipo']),
                'error_message' => $this->getErrorMessage($documento['tipo'])
            ];
        }
        
        return $results;
    }
} 