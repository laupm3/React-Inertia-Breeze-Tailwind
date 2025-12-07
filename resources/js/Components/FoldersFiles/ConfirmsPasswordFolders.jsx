import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import DialogModal from "@/Components/Legacy/DialogModal";
import InputError from "@/Components/InputError";
import { Button } from "../App/Buttons/Button";
import TextInput from "@/Components/TextInput";

export default function ConfirmsPasswordFolders({ show, onClose, onConfirmed }) {
    const [form, setForm] = useState({
        password: "",
        error: "",
        processing: false,
        attempts: 0,
        locked: false,
        lockTime: 0, // segundos restantes de bloqueo
    });

    const passwordInput = useRef(null);

    // Al montar el componente se consulta el estado de la confirmación vía un endpoint del servidor.
    useEffect(() => {
        axios.get(route("files.password.status"))
            .then(({ data }) => {
                // El endpoint devuelve: confirmedUntil, attempts, locked y lockTime.
                if (data.confirmedUntil && data.confirmedUntil > Date.now()) {
                    onConfirmed();
                    onClose();
                } else if (data.locked) {
                    setForm(prev => ({
                        ...prev,
                        attempts: data.attempts,
                        locked: true,
                        lockTime: data.lockTime,
                    }));
                } else {
                    setForm(prev => ({
                        ...prev,
                        attempts: data.attempts || 0,
                        locked: false,
                        lockTime: 0,
                    }));
                }
            })
            .catch(() => {
                setForm(prev => ({
                    ...prev,
                    attempts: 0,
                    locked: false,
                    lockTime: 0,
                }));
            });
    }, [onClose, onConfirmed]);

    // Actualización del contador de bloqueo (lockTime) cada segundo.
    useEffect(() => {
        let timer;
        if (form.locked) {
            timer = setInterval(() => {
                setForm(prev => {
                    const newLockTime = prev.lockTime - 1;
                    if (newLockTime <= 0) {
                        clearInterval(timer);
                        return { ...prev, locked: false, lockTime: 0, attempts: 0 };
                    }
                    return { ...prev, lockTime: newLockTime };
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [form.locked]);

    const confirmPassword = () => {
        // Validación en el frontend: si el campo de la contraseña está vacío, se muestra un mensaje de error.
        if (!form.password.trim()) {
            setForm(prev => ({
                ...prev,
                error: "El campo contraseña no puede estar vacío."
            }));
            return; // Se detiene la ejecución sin realizar la solicitud.
        }
        
        setForm(prev => ({
            ...prev,
            processing: true,
            error: ""
        }));

        axios
            .post(route("files.password.confirm"), { password: form.password })
            .then(() => {
                onConfirmed();
                onClose();
            })
            .catch((error) => {
                // Se asume que la respuesta de error incluye el nuevo estado: { attempts, locked, lockTime }.
                const { data } = error.response;
                if (data.locked) {
                    setForm(prev => ({
                        ...prev,
                        processing: false,
                        attempts: data.attempts,
                        locked: true,
                        lockTime: data.lockTime,
                        error: ""
                    }));
                } else {
                    setForm(prev => ({
                        ...prev,
                        processing: false,
                        attempts: data.attempts,
                        error: "La contraseña introducida es incorrecta."
                    }));
                }
            });
    };

    return (
        <DialogModal
            show={show}
            onClose={onClose}
            title="Confirmar contraseña"
            footer={
                <div className="flex items-center w-full space-x-2">
                    <Button variant={"ghost"} onClick={onClose} className="w-full">
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmPassword}
                        className={`w-full ${form.processing ? "opacity-25" : ""}`}
                        processing={form.processing ? "true" : "false"}
                        disabled={form.locked}
                    >
                        {form.locked ? `${form.lockTime} segundos...` : "Aceptar"}
                    </Button>
                </div>
            }
        >
            Para continuar con el proceso de autenticación en dos pasos, necesitamos que confirmes tu contraseña.
            <div className="mt-4" >
                <TextInput
                    ref={passwordInput}
                    onChange={(e) =>
                        setForm(prev => ({ ...prev, password: e.target.value }))
                    }
                    type="password"
                    className="w-full bg-custom-gray-default border-none focus:ring-0"
                    placeholder="**********"
                    autoComplete="current-password"
                    onKeyUp={(e) => e.key === "Enter" && confirmPassword()}
                    disabled={form.locked}
                />
                <InputError message={form.error} className="mt-2" />
            </div>
        </DialogModal>
    );
}
