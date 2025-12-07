import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface PlaceAutocompleteProps {
  onCoordinatesChange: (coords: { lat: number; lng: number }) => void;
}

const PlaceSearch = ({ onCoordinatesChange }: PlaceAutocompleteProps) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', () => {
      const place = placeAutocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Llamar al callback proporcionado por el padre
        onCoordinatesChange({ lat, lng });
      }
    });
  }, [placeAutocomplete, onCoordinatesChange]);

  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        className="rounded p-2 w-full bg-custom-white dark:bg-custom-gray-darker"
        placeholder="Buscar una ubicación..."
      />
    </div>
  );
};

export default PlaceSearch
