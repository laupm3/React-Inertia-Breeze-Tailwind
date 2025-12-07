import { useEffect, useMemo, useRef } from "react";
import YooptaEditor, { createYooptaEditor } from "@yoopta/editor";

// Plugins básicos
import Paragraph from "@yoopta/paragraph";
import { HeadingOne, HeadingTwo, HeadingThree } from "@yoopta/headings";
import { NumberedList, BulletedList, TodoList } from "@yoopta/lists";

// Plugins de media
import Image from "@yoopta/image";
import Video from "@yoopta/video";

// Marks básicos
import { Bold, Italic, Underline, Strike, CodeMark, Highlight } from "@yoopta/marks";

// UI básica
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import ActionMenuList, { DefaultActionMenuRender } from "@yoopta/action-menu-list";

//Plugins
const plugins = [
  Paragraph,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  NumberedList,
  BulletedList,
  TodoList,  Image.extend({
    elements: {
      image: {
        props: {
          src: null,
          alt: null,
          srcSet: null,
          bgColor: null,
          fit: 'contain',
          sizes: { width: 450, height: 300 }, 
          nodeType: 'void',
        },
      },
    },
    options: {
      maxSizes: { 
        maxWidth: 450, 
        maxHeight: 600 
      },
      async onUpload(file) {
        // Aquí puedes implementar tu lógica de subida de archivos
        // Por ejemplo, subir a tu servidor Laravel
        const formData = new FormData();
        formData.append('image', file);
          try {
          const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
          const headers = {};
          
          if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
          }
          
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
            headers
          });
          
          if (!response.ok) {
            throw new Error('Error al subir la imagen');
          }
          
          const data = await response.json();
          return {
            src: data.url,
            alt: file.name,
            sizes: {
              width: data.width || 800,
              height: data.height || 600
            }
          };
        } catch (error) {
          console.error('Error uploading image:', error);
          // Fallback: crear URL temporal para previsualización
          return {
            src: URL.createObjectURL(file),
            alt: file.name,
            sizes: {
              width: 800,
              height: 600
            }
          };
        }
      }
    }
  }),  Video.extend({
    elements: {
      video: {
        props: {
          src: null,
          poster: null,
          bgColor: null,
          fit: 'cover',
          sizes: { width: 450, height: 300 }, 
          settings: {
            controls: true,
            loop: false,
            muted: false,
            autoPlay: false,
          },
          nodeType: 'void',
        },
      },
    },
    options: {
      maxSizes: { 
         maxWidth: 450, 
        maxHeight: 600
      },
      async onUpload(file) {
        // Lógica similar para videos
        const formData = new FormData();
        formData.append('video', file);
          try {
          const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
          const headers = {};
          
          if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
          }
          
          const response = await fetch('/api/upload-video', {
            method: 'POST',
            body: formData,
            headers
          });
          
          if (!response.ok) {
            throw new Error('Error al subir el video');
          }
          
          const data = await response.json();
          return {
            src: data.url,
            poster: data.poster || null,
            sizes: {
              width: data.width || 800,
              height: data.height || 600
            }
          };
        } catch (error) {
          console.error('Error uploading video:', error);
          // Fallback: crear URL temporal
          return {
            src: URL.createObjectURL(file),
            poster: null,
            sizes: {
              width: 800,
              height: 600
            }
          };
        }
      }
    }
  })
];

// Tools
const TOOLS = {
  Toolbar: {
    tool: Toolbar,
    render: DefaultToolbarRender,
  },
  ActionMenu: {
    tool: ActionMenuList,
    render: DefaultActionMenuRender,
  },
};

// Marks de texto
const MARKS = [Bold, Italic, Underline, Strike, CodeMark, Highlight];

export const isEditorEmpty = (value) =>
  !value ||
  value?.[Object.keys(value)[0]]?.value?.[0]?.children?.[0]?.text === "";

export const Editor = ({ value, onChange, placeholder }) => {
  const editor = useMemo(() => createYooptaEditor(), []);
  const selectionBoxRoot = useRef(null);

  // Actualizamos el editor con el nuevo valor cuando cambie
  useEffect(() => {
    if (editor && value) {
      // Solo actualizar si es necesario
      const currentValue = editor.getEditorValue?.() || {};
      if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
        editor.setEditorValue?.(value);
      }
    }
  }, [editor, value]);

  return (
    <div
      ref={selectionBoxRoot}
      className="w-full"
      style={{ overflowX: 'hidden' }}
    >
      <YooptaEditor
        editor={editor}
        width="100%"
        plugins={plugins}
        tools={TOOLS}
        marks={MARKS}
        placeholder={placeholder || "Escribe algo..."}
        value={value}
        onChange={onChange}
        className="rounded-xl pl-12 pt-1 bg-custom-gray-default dark:bg-custom-blackSemi text-black dark:text-white"
        selectionBoxRoot={selectionBoxRoot}
      />
    </div>
  );
};

export const Viewer = ({ value }) => {
  const viewer = useMemo(() => createYooptaEditor(), []);

  return (
    <div className="w-full h-full">
      {isEditorEmpty(value) ? (
        <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-8">
          <div>
            <p className="text-lg mb-2">No hay contenido para mostrar</p>
            <p className="text-sm opacity-70">Este evento no tiene descripción</p>
          </div>
        </div>
      ) : (
        <YooptaEditor
          readOnly
          editor={viewer}
          width="100%"
          plugins={plugins}
          marks={MARKS}
          value={value}
          className="rounded-xl px-4 py-2 bg-custom-gray-default dark:bg-custom-blackSemi text-black dark:text-white h-full"
        />
      )}
    </div>
  );
};
