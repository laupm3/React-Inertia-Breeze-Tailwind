<h1 align="center">Aplicación de recursos humanos</h1>

<div align="center">
    <img src="https://camo.githubusercontent.com/ae9753b9f718e260707297ff9be5b58e72f39d5e6afb0bac17c35bd2195a8975/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f52656163742d31382e782d626c75652e737667" alt="React" data-canonical-src="https://img.shields.io/badge/React-18.x-blue.svg">
    <img src="https://camo.githubusercontent.com/39b69c74da8419c8d8bcbb2497fd004733321403d7d9b577eed72270bd387e74/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d5461696c77696e642d3338423241433f7374796c653d666c6174266c6f676f3d7461696c77696e642d637373266c6f676f436f6c6f723d7768697465" alt="Tailwind" data-canonical-src="https://img.shields.io/badge/-Tailwind-38B2AC?style=flat&amp;logo=tailwind-css&amp;logoColor=white">
    <img src="https://camo.githubusercontent.com/f187dcd7d8ce0e1bea80ad7f1ff0a84b8e3c3776c4fc4be08abc5942d9a9f52c/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f496e65727469612e6a732d312e782d707572706c652e737667" alt="Inertia.js" data-canonical-src="https://img.shields.io/badge/Inertia.js-1.x-purple.svg">
    <img src="https://camo.githubusercontent.com/1cf7e76377e33c525ce7f5645f062caa61e32d7f2a143fa261c5cbce90820e67/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c61726176656c2d31312e782d7265642e737667" alt="Laravel" data-canonical-src="https://img.shields.io/badge/Laravel-11.x-red.svg"> 
    <img src="https://camo.githubusercontent.com/f2ae3b0ce3751e798f9a241ee2e1b654226a9c8ad8be06b879b9a244d5f9a4ba/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4d7953514c2d382e782d6f72616e67652e737667" alt="MySQL" data-canonical-src="https://img.shields.io/badge/MySQL-8.x-orange.svg">
    <img src="https://camo.githubusercontent.com/5fe05c705bf034839bda7651781e4d0a9d42f4a840478ca5e343873a0361bb89/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5048502d382e322b2d626c75652e737667" alt="PHP" data-canonical-src="https://img.shields.io/badge/PHP-8.2+-blue.svg">
</div>

<h2 align="left">Descripción</h2>
<p>Esta aplicación de recursos humanos está diseñada para facilitar la gestión de empleados en una organización, permitiendo realizar diversas acciones clave como:</p>
<ul>
    <li><strong>Registro y gestión de usuarios</strong>: Alta y baja de empleados.</li>
    <li><strong>Control de fichajes</strong>: Registros de entradas y salidas de los empleados.</li>
    <li><strong>Solicitudes de vacaciones</strong>: Sistema para solicitar y gestionar las vacaciones del personal.</li>
    <li><strong>Gestión de documentación</strong>: Almacenamiento y manejo de documentos importantes, como contratos, permisos, y otros archivos relacionados con los empleados.</li>
</ul>

<h2 align="left">Tecnologías utilizadas</h2>
<p>La aplicación está construida utilizando las siguientes tecnologías:</p>
<ul>
    <li><strong>Frontend</strong>: <a href="https://reactjs.org/" rel="nofollow">React.js</a> con <a href="https://inertiajs.com/" rel="nofollow">Inertia.js</a> y <a href="https://tailwindcss.com/" rel="nofollow">Tailwind</a> - Para crear una experiencia de usuario dinámica y moderna con un enfoque sin recarga de páginas.</li>
    <li><strong>Backend</strong>: <a href="https://laravel.com/" rel="nofollow">Laravel</a> - Framework PHP para la gestión del servidor, base de datos y lógica de negocio.</li>
    <li><strong>Autenticación y seguridad</strong>: Integración de autenticación con <a href="https://jetstream.laravel.com/" rel="nofollow">Laravel Jetstream</a> utilizando verificación en dos pasos (2FA) y login con Google.</li>
    <li><strong>Base de datos</strong>: <a href="https://www.mysql.com/" rel="nofollow">MySQL</a> - Para el almacenamiento de los datos de los empleados, fichajes, vacaciones y documentos.</li>
    <li><strong>Despliegue</strong>: <<a href="https://www.docker.com/" rel="nofollow">Docker</a> - Para un entorno de desarrollo consistente y fácil despliegue.</li>
</ul>

<h2 align="left">Funcionalidades principales</h2>
<ol>
    <li><strong>Gestión de usuarios</strong>:
        <ul>
            <li>Alta y baja de empleados con roles y permisos personalizados.</li>
            <li>Edición de información del perfil de los empleados.</li>
        </ul>
    </li>
    <li><strong>Control de fichajes</strong>:
        <ul>
            <li>Registro de entradas y salidas diarias de los empleados.</li>
            <li>Reportes de asistencia y análisis de horarios.</li>
        </ul>
    </li>
    <li><strong>Gestión de vacaciones</strong>:
        <ul>
            <li>Solicitud de vacaciones con aprobación por parte de los supervisores.</li>
            <li>Gestión de días disponibles y acumulados.</li>
        </ul>
    </li>
        <li><strong>Gestión de documentación:</strong>:
        <ul>
            <li>Subida y almacenamiento de documentos importantes.</li>
            <li>Gestión de contratos, certificados y otros archivos relacionados con los empleados.</li>
        </ul>
    </li>
</ol>

<h2>Requisitos previos</h2>
<ul>
    <li><a href="https://nodejs.org/" rel="nofollow">Node.js</a> y <a href="https://www.npmjs.com/" rel="nofollow">npm</a></li>
    <li><a href="https://www.php.net/" rel="nofollow">PHP</a> >= 8.0</li>
    <li><a href="https://getcomposer.org/" rel="nofollow">Composer</a></li>
    <li><a href="https://www.mysql.com/" rel="nofollow">MySQL</a></li>
    <li><a href="https://www.docker.com/" rel="nofollow">Docker</a> (opcional para despliegue)</li>
</ul>
