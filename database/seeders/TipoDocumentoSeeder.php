<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoDocumento;

class TipoDocumentoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TipoDocumento::create([
            'nombre' => 'DNI', 
            'descripcion' => 'Documento Nacional de Identidad',
            'regex' => '/^[0-9]{8}[A-Z]$/', // 8 dígitos + 1 letra
            'regex_description' => '8 dígitos + 1 letra'
        ]);
        
        TipoDocumento::create([
            'nombre' => 'NIE',
            'descripcion' => 'Número de Identidad de Extranjero',
            'regex' => '/^[XYZ][0-9]{7}[A-Z]$/', // 1 letra + 7 dígitos + 1 letra
            'regex_description' => '1 letra + 7 dígitos + 1 letra'
        ]);
        
        TipoDocumento::create([
            'nombre' => 'Pasaporte',  
            'descripcion' => 'Pasaporte español o extranjero',
            'regex' => '/^[A-Z0-9]{6,9}$/', // 6 a 9 caracteres alfanuméricos
            'regex_description' => '6 a 9 caracteres alfanuméricos'
        ]);
        
        TipoDocumento::create([
            'nombre' => 'Visado Schengen', 
            'descripcion' => 'Visado Schengen',
            'regex' => '/^[A-Z]{2}[0-9]{7}$/', // 2 letras + 7 dígitos
            'regex_description' => '2 letras + 7 dígitos'
        ]);
        
        TipoDocumento::create([
            'nombre' => 'Tarjeta de extranjería', 
            'descripcion' => 'Tarjeta de extranjería',
            'regex' => '/^[A-Z]{1}[0-9]{7}[A-Z]{1}$/', // 1 letra + 7 dígitos + 1 letra
            'regex_description' => '1 letra + 7 dígitos + 1 letra'
        ]);
        
        TipoDocumento::create([
            'nombre' => 'Permiso residencia UE', 
            'descripcion' => 'Permiso de residencia de la Unión Europea',
            'regex' => '/^[A-Z]{2}[0-9]{7}[A-Z]{1}$/', // 2 letras + 7 dígitos + 1 letra
            'regex_description' => '2 letras + 7 dígitos + 1 letra'
        ]);
        
        
    }
}
