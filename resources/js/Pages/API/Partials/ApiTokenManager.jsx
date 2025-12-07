
import ActionMessage from "@/Components/Legacy/ActionMessage";
import ActionSection from "@/Components/Legacy/ActionSection";
import Checkbox from "@/Components/Checkbox";
import DangerButton from "@/Components/Legacy/DangerButton";
import DialogModal from "@/Components/Legacy/DialogModal";
import FormSection from "@/Components/FormSection";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import SectionBorder from "@/Components/SectionBorder";
import TextInput from "@/Components/TextInput";
import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";


export default function ApiTokenManager({ tokens, availablePermissions, defaultPermissions }) {

    const jetstream = usePage().props.jetstream;

    const createApiTokenForm = useForm({
        name: '',
        permissions: defaultPermissions ?? []
    });

    const updatePermissionsApiTokenForm = (e, permission, form) => {
        form.setData('permissions', (e.target.checked) ? [...form.data.permissions, permission] : form.data.permissions.filter(p => p !== permission));
    }

    const updateApiTokenForm = useForm({
        permissions: []
    });

    const deleteApiTokenForm = useForm();

    const [displayingToken, setDisplayingToken] = useState(null);
    const [managingPermissionsFor, setManagingPermissionsFor] = useState(null);
    const [apiTokenBeingDeleted, setApiTokenBeingDeleted] = useState(null);

    const createApiToken = () => {
        createApiTokenForm.post(route('api-tokens.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setDisplayingToken(true);
                createApiTokenForm.reset()
            }
        });
    }

    const manageApiTokenPermissions = (token) => {
        updateApiTokenForm.setData('permissions', token.abilities);
        setManagingPermissionsFor(token);
    }

    const updateApiToken = () => {
        updateApiTokenForm.put(route('api-tokens.update', managingPermissionsFor), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => (setManagingPermissionsFor(null)),
        });
    };

    const confirmApiTokenDeletion = (token) => {
        setApiTokenBeingDeleted(token);
    }

    const deleteApiToken = () => {
        deleteApiTokenForm.delete(route('api-tokens.destroy', apiTokenBeingDeleted), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => (setApiTokenBeingDeleted(null)),
        });
    };

    return (
        <div>
            <FormSection
                onSubmit={createApiToken}
                title={'Create API Token'}
                description={'API tokens allow third-party services to authenticate with our application on your behalf.'}
                actions={
                    <>
                        <ActionMessage on={createApiTokenForm.recentlySuccessful}>
                            <span className="me-3">Created.</span>
                        </ActionMessage>

                        <PrimaryButton className={createApiTokenForm.processing ? 'opacity-25' : ''} disabled={createApiTokenForm.processing}>
                            Create
                        </PrimaryButton>
                    </>
                }
            >
                {/* Token Name */}
                < div className="col-span-6 sm:col-span-4" >
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        value={createApiTokenForm.data.name}
                        onChange={(e) => createApiTokenForm.setData('name', e.target.value)}
                        type="text"
                        className="mt-1 block w-full"
                        autoFocus
                    />
                    <InputError message={createApiTokenForm.errors.name} className="mt-2" />
                </div >

                {/* Token Permissions */}
                {availablePermissions.length > 0 && (
                    <div className="col-span-6">
                        <InputLabel htmlFor="permissions" value="Permissions" />

                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {availablePermissions.map(availablePermission => (
                                <div key={availablePermission}>
                                    <label className="flex items-center">
                                        <Checkbox
                                            checked={createApiTokenForm.data.permissions.find((permission) => permission === availablePermission) ? 'checked' : ''}
                                            value={availablePermission}
                                            onChange={(e) => updatePermissionsApiTokenForm(e, availablePermission, createApiTokenForm)}
                                        />
                                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">{availablePermission}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </FormSection >

            {tokens.length > 0 && (
                <div>
                    <SectionBorder />

                    {/* Manage API Tokens */}
                    <div className="mt-10 sm:mt-0">
                        <ActionSection
                            title="Manage API Tokens"
                            description="You may delete any of your existing tokens if they are no longer needed."
                        >
                            <div className="space-y-6">
                                {tokens.map((token) => (
                                    <div key={token.id} className="flex items-center justify-between">
                                        <div className="break-all dark:text-white">
                                            {token.name}
                                        </div>

                                        <div className="flex items-center ms-2">
                                            {token.last_used_ago && (
                                                <div className="text-sm text-gray-400">
                                                    Last used {token.last_used_ago}
                                                </div>
                                            )}

                                            {availablePermissions.length > 0 && (
                                                <button
                                                    className="cursor-pointer ms-6 text-sm text-gray-400 underline"
                                                    onClick={() => manageApiTokenPermissions(token)}
                                                >
                                                    Permissions
                                                </button>
                                            )}

                                            <button className="cursor-pointer ms-6 text-sm text-red-500" onClick={() => confirmApiTokenDeletion(token)}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ActionSection>
                    </div>
                </div>
            )}

            {/* Token Value Modal */}
            <DialogModal
                show={displayingToken}
                onClose={() => setDisplayingToken(false)}
                title="API Token"
                footer={
                    <SecondaryButton onClick={() => setDisplayingToken(false)}>
                        Close
                    </SecondaryButton>
                }
            >
                <div>
                    Please copy your new API token. For your security, it won't be shown again.
                </div>

                {jetstream.flash.token && (
                    <div className="mt-4 bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded font-mono text-sm text-gray-500 break-all">
                        {jetstream.flash.token}
                    </div>
                )}
            </DialogModal>

            {/* API Token Permissions Modal */}
            <DialogModal
                show={managingPermissionsFor != null}
                onClose={() => setManagingPermissionsFor(false)}
                title="API Token Permissions"
                footer={
                    <>
                        <SecondaryButton onClick={() => setManagingPermissionsFor(null)}>
                            Cancel
                        </SecondaryButton>

                        <PrimaryButton
                            className={"ms-3 " + (updateApiTokenForm.processing ? 'opacity-25' : '')}
                            disabled={updateApiTokenForm.processing}
                            onClick={updateApiToken}
                        >
                            Save
                        </PrimaryButton>
                    </>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availablePermissions.map(availablePermission => (
                        <div key={availablePermission}>
                            <label className="flex items-center">
                                <Checkbox
                                    checked={updateApiTokenForm.data.permissions.find((permission) => permission === availablePermission) ? 'checked' : ''}
                                    value={availablePermission}
                                    onChange={(e) => updatePermissionsApiTokenForm(e, availablePermission, updateApiTokenForm)}
                                />
                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">{availablePermission}</span>
                            </label>
                        </div>
                    ))}
                </div>
            </DialogModal>

            {/* Delete Token Confirmation Modal */}
            <DialogModal
                show={apiTokenBeingDeleted != null}
                onClose={() => setApiTokenBeingDeleted(null)}
                title="Delete API Token"
                footer={
                    <>
                        <SecondaryButton onClick={() => setApiTokenBeingDeleted(null)}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton
                            className={"ms-3 " + (deleteApiTokenForm.processing ? 'opacity-25' : '')}
                            disabled={deleteApiTokenForm.processing}
                            onClick={deleteApiToken}
                        >
                            Delete
                        </DangerButton>
                    </>
                }
            >
                Are you sure you would like to delete this API token?
            </DialogModal>
        </div >
    )
}