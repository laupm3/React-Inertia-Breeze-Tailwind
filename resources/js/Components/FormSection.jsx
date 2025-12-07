import SectionTitle from '@/Components/SectionTitle';

export default function FormSection({ onSubmit, title, description, children, actions = null }) {

    const onSubmitHandler = (e) => {

        e.preventDefault();

        if (onSubmit) {
            onSubmit();
        }
    }

    const hasActions = actions !== null;

    return (
        <div className="md:grid md:grid-cols-3 md:gap-6">
            {/* Título y descripción */}
            <SectionTitle
                title={title}
                description={description}
            >
            </SectionTitle>

            {/* Contenido del formulario */}
            <div className="mt-5 md:mt-0 md:col-span-2">
                <form
                    onSubmit={onSubmitHandler}
                >
                    <div
                        className={`px-4 py-5 bg-white dark:bg-gray-800 sm:p-6 shadow ${hasActions ? 'sm:rounded-tl-md sm:rounded-tr-md' : 'sm:rounded-md'
                            }`}
                    >
                        <div className="grid grid-cols-6 gap-6">
                            {children}
                        </div>
                    </div>

                    {/* Acciones, si están presentes */}
                    {hasActions && (
                        <div className="flex items-center justify-end px-4 py-3 bg-gray-50 dark:bg-gray-800 text-end sm:px-6 shadow sm:rounded-bl-md sm:rounded-br-md">
                            {actions}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
