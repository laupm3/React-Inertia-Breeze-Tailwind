import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ApiTokenManager from "@/Pages/API/Partials/ApiTokenManager";
import { Head } from "@inertiajs/react";

export default function Index({ tokens, availablePermissions, defaultPermissions }) {

    return (
        <>
            <Head title="API Tokens" />

            <div>
                <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
                    <ApiTokenManager
                        tokens={tokens}
                        availablePermissions={availablePermissions}
                        defaultPermissions={defaultPermissions}
                    />
                </div>
            </div>
        </>
    )
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;