import axios from 'axios';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

const Import = ({ auth }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [invalidRows, setInvalidRows] = useState([]);
    const [importedCount, setImportedCount] = useState(0);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setSuccess(false);
        setInvalidRows([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        setSuccess(false);
        setInvalidRows([]);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(route('empleados.import'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setSuccess(true);
                setImportedCount(response.data.data.imported);
            } else {
                setInvalidRows(response.data.data.invalidRows);
                setImportedCount(response.data.data.imported);
            }
        } catch (error) {
            if (error.response?.data?.data?.invalidRows) {
                setInvalidRows(error.response.data.data.invalidRows);
                setImportedCount(error.response.data.data.imported);
            } else {
                setError(error.response?.data?.message || 'Error al importar el archivo');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Importar Empleados</h2>}
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Archivo Excel
                                    </label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileChange}
                                        className="mt-1 block w-full"
                                    />
                                </div>

                                <div className="flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={!file || loading}
                                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                                    >
                                        {loading ? 'Importando...' : 'Importar'}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-sm text-green-600">
                                        Se importaron {importedCount} empleados correctamente.
                                    </p>
                                </div>
                            )}

                            {invalidRows.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Filas con errores ({invalidRows.length})
                                    </h3>
                                    <div className="mt-2 overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Fila
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Datos
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Errores
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {invalidRows.map((row, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {row.row}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <pre className="text-xs">
                                                                {JSON.stringify(row.data, null, 2)}
                                                            </pre>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                                            <ul className="list-disc list-inside">
                                                                {row.errors.map((error, i) => (
                                                                    <li key={i}>{error}</li>
                                                                ))}
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Import; 