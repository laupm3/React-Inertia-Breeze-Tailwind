<?php

return [
    /*
     | La tabla donde se almacenarán los trabajos rastreados.
     | Por defecto, se llama 'tracked_jobs'.
     */
    'tables' => [
        'tracked_jobs' => 'tracked_jobs',
    ],

    /*
     | Determina si estás usando uuid o no.
     */
    'using_uuid' => false,

    /*
     | Esto configura la edad máxima de los modelos (en días) antes de que se eliminen.
     | Si es null, no se eliminará ningún modelo.
     */
    'prunable_after' => null
];
