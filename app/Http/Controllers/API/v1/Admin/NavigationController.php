<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\Link;
use Illuminate\Http\Response;
use App\Services\NavigationService;
use App\Http\Controllers\Controller;
use App\Http\Resources\LinkResource;
use App\Http\Requests\Navigation\LinksShowRequest;
use App\Http\Requests\Navigation\LinksIndexRequest;
use App\Http\Requests\Navigation\LinksStoreRequest;
use App\Http\Requests\Navigation\LinksUpdateRequest;
use App\Http\Requests\Navigation\LinksDestroyRequest;
use Illuminate\Support\Facades\DB;

class NavigationController extends Controller
{
    protected $navigationService;

    public function __construct(NavigationService $navigationService)
    {
        $this->navigationService = $navigationService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(LinksIndexRequest $request)
    {
        $tree = $this->navigationService->getNavigationTree();

        return response()->json(status: Response::HTTP_OK, data: [
            'links' => LinkResource::collection($tree)
        ]);
    }

    /**
     * Store a newly created link in storage.
     *
     * @param LinksStoreRequest $request Validated request with link data
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(LinksStoreRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $link = Link::create($validated);

            if (!$link) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido crear el link.'
                ]);
            }

            $tree = $this->navigationService->buildBranchFromLink($link);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Enlace creado correctamente.',
                'link' => new LinkResource($tree)
            ]);
        });
    }

    /**
     * Display the specified resource.
     * 
     */
    public function show(LinksShowRequest $request, Link $link)
    {
        $tree = $this->navigationService->buildBranchFromLink($link);

        return response()->json([
            'link' => new LinkResource($tree)
        ], Response::HTTP_OK);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param LinksUpdateRequest $request Validated request with updated validated data
     * @param Link $asignacion The resource to update
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(LinksUpdateRequest $request, Link $link)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $link) {

            $updateResult = $link->update($validated);

            if (!$updateResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'Error al actualizar el link.'
                ]);
            }

            $tree = $this->navigationService->buildBranchFromLink($link);

            return response()->json(status: Response::HTTP_CREATED, data: [
                'message' => 'Enlace actualizado correctamente.',
                'link' => new LinkResource($tree)
            ]);
        });
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param LinksDestroyRequest $request
     * @param Link $role The resource to delete
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(LinksDestroyRequest $request, Link $link)
    {
        return DB::transaction(function () use ($link) {

            if ($link->children()->count() > 0) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se puede eliminar el link porque tiene links asociados.'
                ]);
            }

            $deleteResult = $link->delete();

            if (!$deleteResult) {
                return response()->json(status: Response::HTTP_UNPROCESSABLE_ENTITY, data: [
                    'message' => 'No se ha podido eliminar el link.'
                ]);
            }

            return response()->json(status: Response::HTTP_OK, data: [
                'message' => 'Link eliminado correctamente.'
            ]);
        });
    }
}
