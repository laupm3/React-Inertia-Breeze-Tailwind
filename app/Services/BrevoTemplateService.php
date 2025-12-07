<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class BrevoTemplateService
{
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.brevo.api_key');
        $this->baseUrl = 'https://api.brevo.com/v3/smtp/templates';
    }

    /**
     * Obtiene las plantillas de Brevo con la API de Brevo.
     *
     * @return \Illuminate\Support\Collection
     * @throws \Exception 
     */
    public function getTemplates(): \Illuminate\Support\Collection
    {
        $response = Http::withHeaders([
            'api-key' => $this->apiKey,
            'accept' => 'application/json',
        ])->get($this->baseUrl);

        if ($response->failed()) {
            throw new \Exception('Error al obtener las plantillas de Brevo');
        }

        $templates = collect($response->json('templates'));

        return $templates;
    }
}
