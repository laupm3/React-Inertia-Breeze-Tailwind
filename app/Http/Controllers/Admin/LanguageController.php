<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Language;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class LanguageController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Admin/Languages/Index', [
            'languages' => Language::all(),
        ]);
    }

    /**
    *Display a form for creating a new resource.
     *
    * 
    */

    public function create()
    {
        return Inertia::render('Admin/Languages/Create');
    }

    public function store(Request $request)
    {
        Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'locale' => ['required', 'string', 'max:5'],
            'region' => ['nullable', 'string', 'max:255'],
            'cultural_configuration' => ['nullable', 'string', 'max:255'],
            'is_default' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ])->validateWithBag('createLanguage');

        Language::create($request->all());

        return redirect()->route('languages.index')
            ->warningBanner('Language created successfully.');
    }

    public function edit(Language $language)
    {
        return view('admin.languages.edit', compact('language'));
    }

    public function update(Request $request, Language $language)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'locale' => 'required|string|max:5',
            'region' => 'nullable|string|max:255',
            'cultural_configuration' => 'nullable|string|max:255',
            'is_default' => 'required|boolean',
            'is_active' => 'required|boolean',
        ]);

        $language->update($request->all());

        return redirect()->route('languages.index')
            ->with('success', 'Language updated successfully.');
    }

    public function destroy(Language $language)
    {
        $language->delete();

        return redirect()->route('languages.index')
            ->warningBanner('Language deleted successfully.');
    }
}
