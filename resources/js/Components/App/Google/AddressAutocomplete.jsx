import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

/**
 * Predefined component made by Google, use a text input to search for places
 * 
 * @param {CallableFunction} onCoordinatesChange Handle the coordinates change
 * @returns {JSX.Element}
 */
export default function AddressAutocomplete({ onCoordinatesChange }) {
    const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
    const inputRef = useRef(null);
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
                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                placeholder="Buscar una ubicación..."
            />
        </div>
    );
};
