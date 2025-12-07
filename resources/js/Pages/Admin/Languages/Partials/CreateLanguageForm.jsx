import { useForm, usePage, Link } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
import { Button } from '@/Components/ui/button';
import { Alert } from '@/Components/ui/alert';

export default function CreateLanguageForm({ language }) {
    const { errors } = usePage().props;
    const { data, setData, post, put, processing } = useForm({
        name: language?.name || '',
        locale: language?.locale || '',
        region: language?.region || '',
        cultural_configuration: language?.cultural_configuration || '',
        is_default: language?.is_default || false,
        is_active: language?.is_active || true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (language) {
            put(route('languages.update', language.id));
        } else {
            post(route('languages.store'));
        }
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">{language ? 'Edit Language' : 'Add New Language'}</h1>

            {/* Mostrar errores */}
            {errors && (
                <Alert variant="danger" className="mb-4">
                    {Object.values(errors).join(', ')}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
                        Locale
                    </label>
                    <Input
                        id="locale"
                        value={data.locale}
                        onChange={(e) => setData('locale', e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                        Region
                    </label>
                    <Input
                        id="region"
                        value={data.region}
                        onChange={(e) => setData('region', e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="cultural_configuration" className="block text-sm font-medium text-gray-700">
                        Cultural Configuration
                    </label>
                    <Input
                        id="cultural_configuration"
                        value={data.cultural_configuration}
                        onChange={(e) => setData('cultural_configuration', e.target.value)}
                    />
                </div>

                <div className="flex items-center">
                    <Checkbox
                        id="is_default"
                        checked={data.is_default}
                        onChange={(e) => setData('is_default', e.target.checked)}
                    />
                    <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                        Default Language
                    </label>
                </div>

                <div className="flex items-center">
                    <Checkbox
                        id="is_active"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                        Active
                    </label>
                </div>

                <div className="flex space-x-2">
                    <Button type="submit" className="btn btn-primary" disabled={processing}>
                        {language ? 'Update Language' : 'Save Language'}
                    </Button>
                    <Link href={route('languages.index')} className="btn btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
};
