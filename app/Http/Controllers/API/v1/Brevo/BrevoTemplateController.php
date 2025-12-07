<?php

namespace App\Http\Controllers\API\v1\Brevo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Brevo\BrevoIndexRequest;
use App\Http\Requests\Brevo\BrevoTemplatesIndexRequest;
use App\Http\Resources\BrevoTemplateCollection;
use App\Http\Resources\BrevoTemplateResource;
use App\Services\BrevoTemplateService;
use Illuminate\Http\Response;

class BrevoTemplateController extends Controller
{
    protected $brevo;

    public function __construct(BrevoTemplateService $brevo)
    {
        $this->brevo = $brevo;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(BrevoTemplatesIndexRequest $request)
    {
        try {
            $templates = $this->brevo->getTemplates();
            return response()->json(
                status: Response::HTTP_OK,
                data: [
                    'templates' => BrevoTemplateResource::collection($templates)->values(),
                ],
            );
        } catch (\Exception $e) {
            return response()->json(
                status: Response::HTTP_UNAUTHORIZED,
                data: [
                    'error' => $e->getMessage(),
                ],
            );
        }
    }
}
