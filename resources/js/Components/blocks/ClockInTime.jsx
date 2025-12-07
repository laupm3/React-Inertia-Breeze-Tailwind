import React from "react";
import { toast } from "sonner";

const MT = {
  antesDeFicharEntrada: 5,
  despuesDeFicharEntrada: 5,
  antesDeFicharDescanso: 5,
  despuesDeFicharDescanso: 5,
  antesDeFicharDescansoFin: 5,
  despuesDeFicharDescansoFin: 5,
  antesDeFicharSalida: 5,
  despuesDeFicharSalida: 0,
};

const sendNotification = (title, message, onlyNotify = false) => {
  if ("Notification" in window) {
    if (window.Notification.permission === "granted") {
      new window.Notification(title, { body: message });
    } else if (window.Notification.permission !== "denied") {
      window.Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new window.Notification(title, { body: message });
        }
      });
    }
  }

  const NotificationStructure = (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex flex-col">
        <strong>{title}</strong>
        <br />
        <span>{message}</span>
      </div>
      <div>
        <button
          className="bg-custom-orange text-white rounded-lg px-4 py-2 mt-2 hover:bg-custom-orange/80 text-nowrap"
          onClick={() => toast.dismiss()}
        >
          Vale
        </button>
      </div>
    </div>
  );

  {
    !onlyNotify &&
    toast(NotificationStructure, {
      position: "bottom-right",
      duration: 5000,
      style: {
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "#212529"
          : "#FFFFFF",
        border: "none",
        boxShadow: "none",
      },
    });
  }
};

function addSubtractTime({ time, minutes, add = true }) {
  const date = new Date(`2000-01-01T${time}:00`);
  const sign = add ? 1 : -1;
  date.setMinutes(date.getMinutes() + sign * minutes);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ClockInTime({
  currentTime,
  fichaje,
  fichajes,
  isClockingIn,
  isPaused,
  openModal,
  countDown,
}) {

  const {
    antesDeFicharEntrada,
    despuesDeFicharEntrada,
    antesDeFicharDescanso,
    despuesDeFicharDescanso,
    antesDeFicharDescansoFin,
    despuesDeFicharDescansoFin,
    antesDeFicharSalida,
    despuesDeFicharSalida,
  } = MT;

  const timeToSeconds = (time) => {
    const [hours, minutes] = time.split(":");
    return parseInt(hours) * 3600 + parseInt(minutes) * 60;
  };

  if (!fichajes || fichajes.length === 0) return null;

  const checkTime = (time, minutes, add = true) =>
    currentTime === addSubtractTime({ time, minutes, add });

  if (
    !isClockingIn &&
    checkTime(fichaje?.hora_entrada, antesDeFicharEntrada, false)
  ) {
    sendNotification(
      "Fichaje",
      `Quedan ${antesDeFicharEntrada} minutos para la hora de fichaje`
    );
  }

  if (
    !isClockingIn &&
    checkTime(fichaje?.hora_entrada, despuesDeFicharEntrada, true)
  ) {
    sendNotification(
      "Fichaje",
      `Han pasado ${despuesDeFicharEntrada} minutos desde la hora de fichaje`
    );
  }

  if (isClockingIn && checkTime(fichaje?.descanso_inicio, antesDeFicharDescanso, false)) {
    sendNotification(
      "Descanso",
      `Quedan ${antesDeFicharDescanso} minutos para el descanso obligatorio`
    );
  }

  if (
    isClockingIn &&
    !isPaused &&
    checkTime(fichaje?.descanso_inicio, despuesDeFicharDescanso, true)
  ) {
    sendNotification(
      "Descanso",
      `Han pasado ${despuesDeFicharDescanso} minutos desde que empezo el descanso obligatorio`
    );
  }

  if (isClockingIn && checkTime(fichaje?.descanso_fin, antesDeFicharDescansoFin, false)) {
    sendNotification(
      "Descanso",
      `Quedan ${antesDeFicharDescansoFin} minutos para finalizar el descanso obligatorio`
    );
  }

  if (isClockingIn && checkTime(fichaje?.descanso_fin, despuesDeFicharDescansoFin, true)) {
    sendNotification(
      "Descanso",
      `Han pasado ${despuesDeFicharDescansoFin} minutos desde que finalizo el descanso obligatorio`
    );
  }

  if (isClockingIn && checkTime(fichaje?.hora_salida, antesDeFicharSalida, false)) {
    sendNotification(
      "Fichaje",
      `Quedan ${antesDeFicharSalida} minutos para finalizar el turno`
    );
  }

  if (
    isClockingIn &&
    timeToSeconds(currentTime) >=
    timeToSeconds(addSubtractTime({ time: fichaje?.hora_salida, minutes: despuesDeFicharSalida, add: true })) &&
    countDown <= 0
  ) {
    openModal({
      title: "Fichaje",
      content: "¿Quieres fichar la salida?",
      action: 'finalize',
    });
    sendNotification("Fichaje", `Es hora de fichar la salida`, true);
  }

  if (fichajes.length > 1) {
    const horasCoincidentes = [];

    fichajes.forEach((fichaje) => {
      const coincidencia = fichajes.find(
        (otro) =>
          otro.hora_salida === fichaje.hora_entrada &&
          otro.horario_id !== fichaje.horario_id
      );
      if (coincidencia) {
        horasCoincidentes.push(fichaje.hora_entrada);
      }
    });

    if (
      isClockingIn &&
      horasCoincidentes.some((hora) => currentTime === hora) &&
      !isPaused
    ) {
      openModal({
        title: "Fichaje",
        content: "Ha pasado la hora de tu primer turno, Se ha cambiado el fichaje a tu siguiente turno",
        action: 'change',
      });
      sendNotification("Fichaje", `Es hora de cambiar de turno`, true);
    } else if (
      isClockingIn &&
      horasCoincidentes.some((hora) => currentTime === hora) &&
      isPaused
    ) {
      openModal({
        title: "Fichaje",
        content: "Tu turno esta pausado, ¿quieres finalizar tu horario para poder fichar en tu siguiente turno?",
        action: 'finalize',
      });
      sendNotification("Fichaje", `Es hora de cambiar de turno`, true);
    }
  }
}
