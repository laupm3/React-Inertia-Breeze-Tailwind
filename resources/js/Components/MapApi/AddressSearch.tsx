import React, { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import PlaceSearch from '@/Components/MapApi/PlaceSearch';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const AddressSearch = () => {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleCoordinatesChange = (coords: { lat: number; lng: number }) => {
    setCoordinates(coords);
    console.log('Coordenadas recibidas en el padre:', coords);
  };

  return (
    <APIProvider
      apiKey={API_KEY}
      solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
    >
        <div className="p-4 bg-custom-white dark:bg-custom-blackSemi rounded shadow-lg max-w-md w-full">
          <h1 className="text-xl font-semibold mb-4 text-custom-black dark:text-custom-white">Buscar Dirección</h1>
          <PlaceSearch onCoordinatesChange={handleCoordinatesChange} />
          {coordinates && (
            <div className="mt-4">
              <h2 className="text-lg font-medium text-custom-gray-darker dark:text-custom-gray-dark">Coordenadas:</h2>
              <p className="text-custom-gray-darker dark:text-custom-gray-dark">Latitud: {coordinates.lat}</p>
              <p className="text-custom-gray-darker dark:text-custom-gray-dark">Longitud: {coordinates.lng}</p>
            </div>
          )}
        </div>
    </APIProvider>
  );
};

export default AddressSearch;
