import { useState, useRef } from 'react';
import axios from 'axios';
import DialogModal from "@/Components/Legacy/DialogModal";
import InputError from "@/Components/InputError";
import { Input } from "@/Components/ui/input";
import TextInput from "@/Components/OwnUi/TextInput";
import { Button } from '../App/Buttons/Button';

export default function ConfirmsPassword({ title = 'Confirmar contraseña', content = 'Por tu seguridad, por favor confirma tu contraseña para continuar.', children, onConfirmed }) {
    const [confirmingPassword, setConfirmingPassword] = useState(false);
    const [form, setForm] = useState({
        password: '',
        error: '',
        processing: false,
    });

    const passwordInput = useRef(null);

    const startConfirmingPassword = () => {
        axios.get(route('password.confirmation')).then(response => {
            if (response.data.confirmed) {
                onConfirmed();
            } else {
                setConfirmingPassword(true);

                setTimeout(() => passwordInput.current.focus(), 250);
            }
        });
    };

    const confirmPassword = () => {
        setForm({ ...form, processing: true });

        axios.post(route('password.confirm'), {
            password: form.password,
        }).then(() => {
            setForm({ ...form, processing: false });

            closeModal();
            onConfirmed();

        }).catch(error => {
            setForm({
                ...form,
                processing: false,
                error: error.response.data.errors.password[0],
            });
            passwordInput.current.focus();
        });
    };

    const closeModal = () => {
        setConfirmingPassword(false);
        setForm({
            password: '',
            error: '',
            processing: false,
        });
    };

    return (
        <span>
            <span onClick={startConfirmingPassword}>
                {/* Render the trigger */}
                {children}
            </span>

            <DialogModal
                show={confirmingPassword}
                onClose={closeModal}
                title={title}
                footer={
                    <>
                        <Button
                            variant={"secondary"}
                            onClick={closeModal}
                            className='mr-2'
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={"primary"}
                            onClick={confirmPassword}
                            processing={form.processing ? 'true' : 'false'}
                        >
                            Confirm
                        </Button>
                    </>
                }
            >
                {content}
                <div className="mt-4">
                    <Input
                        ref={passwordInput}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        onKeyUp={(e) => e.key === 'Enter' && confirmPassword()}
                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                    />
                    <InputError message={form.error} className="mt-2" />

                </div>
            </DialogModal>
        </span>
    )
}