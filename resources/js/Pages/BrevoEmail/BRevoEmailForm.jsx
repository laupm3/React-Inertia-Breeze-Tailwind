import { useState, useRef } from 'react';
import axios from 'axios';

export default function BRevoEmailForm({ empleados }) {
  // Estados
  const [destinatariosInput, setDestinatariosInput] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [message1, setMessage1] = useState('');
  const [message2, setMessage2] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Referencia para el input de archivos
  const fileInputRef = useRef(null);

  // Maneja selección de archivos
  const handleFileChange = (e) => {
    setAttachments([...e.target.files]);
  };

  // Enviar correo
  const sendEmail = async () => {
    setError(null);
    setSuccess(null);

    // 1. Generar array final de correos
    let todosLosEmails = [];
    if (destinatariosInput.includes('{todos}')) {
      todosLosEmails = empleados.map((empleado) => empleado.email);
    }
    const otrosEmails = destinatariosInput
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email !== '{todos}' && email !== '');

    const destinatarios = [...new Set([...todosLosEmails, ...otrosEmails])];

    // Validar que los campos obligatorios estén completos
    if (!destinatarios.length || !subject.trim() || !message.trim()) {
      setError('Todos los campos obligatorios deben estar completos.');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      destinatarios.forEach((email) => {
        formDataToSend.append('to[]', email);
      });
      formDataToSend.append('subject', subject);
      formDataToSend.append('message', message);

      if (message1.trim()) {
        formDataToSend.append('message1', message1);
      }
      if (message2.trim()) {
        formDataToSend.append('message2', message2);
      }

      //Add files to FormData, any existing
      if (attachments.length > 0) {
        attachments.forEach((file) => {
          formDataToSend.append('attachments[]', file);
        });
      }

      const response = await axios.post('/api/send-email', formDataToSend);
      //clean the form if the email was sent
      if (response.data.message) {
        setSuccess('¡Correo enviado exitosamente!');
        setDestinatariosInput('');
        setSubject('');
        setMessage('');
        setMessage1('');
        setMessage2('');
        setAttachments([]);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el correo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDestinatariosInput('');
    setSubject('');
    setMessage('');
    setMessage1('');
    setMessage2('');
    setAttachments([]);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const syncTemplates = async () => {
    const response = await axios.get('/sync-templates');
    console.log(response.data);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-black font-semibold mb-4">Enviar Email</h2>

      {/* Mail Recipient */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Para (usa {`{todos}`} o correos separados por coma):
        </label>
        <input
          type="text"
          value={destinatariosInput}
          onChange={(e) => setDestinatariosInput(e.target.value)}
          placeholder="Ejemplo: {todos}, usuario1@dominio.com"
          className="w-full text-black p-2 border rounded"
        />
      </div>

      {/* Subject */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asunto:
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Asunto"
          className="w-full text-black p-2 border rounded"
        />
      </div>

      {/* Principal Message */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje:
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensaje"
          className="w-full text-black p-2 border rounded"
          rows={4}
        />
      </div>

      {/* Optional Message 1 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje Opcional 1:
        </label>
        <textarea
          value={message1}
          onChange={(e) => setMessage1(e.target.value)}
          placeholder="Mensaje Opcional 1"
          className="w-full text-black p-2 border rounded"
          rows={4}
        />
      </div>

      {/* Optional Message 2 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje Opcional 2:
        </label>
        <textarea
          value={message2}
          onChange={(e) => setMessage2(e.target.value)}
          placeholder="Mensaje Opcional 2"
          className="w-full text-black p-2 border rounded"
          rows={4}
        />
      </div>

      {/* Adjuntar archivos */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adjuntar archivos:
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          className="text-black"
        />
      </div>

      {/* Mensajes de error y éxito */}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <div>
        <button onClick={syncTemplates}>
          Sincronizar plantillas
        </button>
      </div>

      {/* Botones Enviar y Cancelar */}
      <div className="flex gap-2">
        <button
          onClick={sendEmail}
          className={`w-full p-2 text-white rounded ${loading ? 'bg-gray-400' : 'bg-green-500'}`}
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Email'}
        </button>
        <button
          onClick={handleCancel}
          className="w-full p-2 text-white bg-red-500 rounded"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
