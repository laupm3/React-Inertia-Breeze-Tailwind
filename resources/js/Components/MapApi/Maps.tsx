import { useState } from 'react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const Maps = ({ centers, center, zoom = 7 }) => {
  console.log('center :>> ', center);
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="h-screen bg-gray-100 flex flex-col justify-center items-center z-0">
      <APIProvider
        solutionChannel="GMP_devsite_samples_v3_rgmbasicmap"
        apiKey={API_KEY}
      >
        <div className="w-full h-full">
          <Map
            defaultZoom={zoom}
            defaultCenter={center || { lat: 40.468419, lng: -3.784041 }}
            gestureHandling="greedy"
            disableDefaultUI={true}
          >
            {/* Añadir los marcadores al mapa */}
            {centers && centers.map((center, index) => (
              <Marker
                key={index}
                position={{ lat: center.direccion.latitud, lng: center.direccion.longitud }}
                title={center.nombre}
                onClick={() => setSelectedLocation(center)} // Cuando se hace clic en un marcador
              />
            ))}

            {/* Mostrar ventana de información cuando se selecciona un marcador */}
            {selectedLocation && (
              <InfoWindow
                position={{
                  lat: selectedLocation.direccion.latitud,
                  lng: selectedLocation.direccion.longitud
                }}
                onCloseClick={() => setSelectedLocation(null)} // Cerrar ventana al hacer clic
              >
                <div>
                  <h3 className="font-bold text-lg text-custom-black">{selectedLocation.nombre}</h3>
                  <p className='text-sm font-medium text-custom-black'>{selectedLocation.info}</p>
                  <br />
                  <a
                    className='text-custom-orange font-bold hover:text-custom-orange/70 duration-200'
                    href={`https://www.google.com/maps?q=${selectedLocation.latitud},${selectedLocation.longitud}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver en Google Maps
                  </a>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      </APIProvider>
    </div>
  );
};

export default Maps;