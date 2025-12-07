import { useEffect, useState, useCallback, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/Components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"

// This is a custom built autocomplete component using the "Autocomplete Service" for predictions
// and the "Places Service" for place details
const Autocomplete = ({ onPlaceSelect, selectedAddress = '' }) => {
    const map = useMap();
    const places = useMapsLibrary('places');
    const debounceTimeout = useRef(null);
    const containerRef = useRef(null);

    // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompleteSessionToken
    const [sessionToken, setSessionToken] = useState();

    // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service
    const [autocompleteService, setAutocompleteService] = useState(null);

    // https://developers.google.com/maps/documentation/javascript/reference/places-service
    const [placesService, setPlacesService] = useState(null);

    const [predictionResults, setPredictionResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (!places || !map) return;

        setAutocompleteService(new places.AutocompleteService());
        setPlacesService(new places.PlacesService(map));
        setSessionToken(new places.AutocompleteSessionToken());

        return () => setAutocompleteService(null);
    }, [map, places]);

    useEffect(() => {
        setInputValue(selectedAddress);
    }, [selectedAddress]);

    // Función para cerrar el dropdown
    const closeDropdown = useCallback(() => {
        setShowDropdown(false);
        setPredictionResults([]);
    }, []);

    // Event listeners para cerrar dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        const handleScroll = (event) => {
            // Solo cerrar si el scroll NO ocurre dentro del dropdown o el input
            const scrollingElement = event.target || event.currentTarget;
            if (containerRef.current && !containerRef.current.contains(scrollingElement)) {
                // Verificar también que no sea scroll dentro de un elemento del dropdown
                const dropdownElement = containerRef.current.querySelector('.absolute');
                if (!dropdownElement || !dropdownElement.contains(scrollingElement)) {
                    closeDropdown();
                }
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                closeDropdown();
            }
        };

        // Agregar event listeners
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside); // Para móvil
        document.addEventListener('scroll', handleScroll, true); // true para capturar en fase de captura
        document.addEventListener('keydown', handleEscape);
        
        // Escuchar scroll en el modal específicamente
        const modalElement = document.querySelector('[role="dialog"]');
        if (modalElement) {
            modalElement.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('scroll', handleScroll, true);
            document.removeEventListener('keydown', handleEscape);
            if (modalElement) {
                modalElement.removeEventListener('scroll', handleScroll, true);
            }
        };
    }, [closeDropdown]);

    const fetchPredictions = useCallback(
        async (inputValue) => {
            if (!autocompleteService || !inputValue) {
                setPredictionResults([]);
                setShowDropdown(false);
                return;
            }

            const request = { input: inputValue, sessionToken };
            const response = await autocompleteService.getPlacePredictions(request);

            setPredictionResults(response.predictions);
            setShowDropdown(response.predictions.length > 0);
        },
        [autocompleteService, sessionToken]
    );

    const onInputChange = useCallback(
    (event) => {
        const value = event.target?.value || '';
        setInputValue(value);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            fetchPredictions(value);
            
            // 👇 Si se borra el input manualmente, notificamos que no hay dirección
            if (value.trim() === '') {
                onPlaceSelect({
                    full_address: '',
                    latitud: null,
                    longitud: null
                });
                setShowDropdown(false);
            }
        }, 400);
    },
    [fetchPredictions, onPlaceSelect]
);

    const handleInputFocus = useCallback(() => {
        if (predictionResults.length > 0) {
            setShowDropdown(true);
        }
    }, [predictionResults.length]);


    const handleSuggestionClick = useCallback(
        (placeId) => {
            if (!places) return;

            const detailRequestOptions = {
                placeId,
                fields: ['geometry', 'name', 'formatted_address'],
                sessionToken
            };

            const detailsRequestCallback = (
                placeDetails
            ) => {
                onPlaceSelect({
                    full_address: placeDetails?.formatted_address,
                    latitud: placeDetails?.geometry.location.lat(),
                    longitud: placeDetails?.geometry.location.lng()
                });
                setPredictionResults([]);
                setShowDropdown(false);
                setInputValue(placeDetails?.formatted_address ?? '');
                setSessionToken(new places.AutocompleteSessionToken());
            };

            placesService?.getDetails(detailRequestOptions, detailsRequestCallback);
        },
        [onPlaceSelect, places, placesService, sessionToken]
    );

    return (
        <div className="autocomplete-container relative w-full" ref={containerRef}>
            <Input
                value={inputValue}
                autoFocus={true}
                onInput={(event) => onInputChange(event)}
                onFocus={handleInputFocus}
                placeholder="Busca una dirección..."
                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi w-full text-sm"
            />
            {showDropdown && predictionResults.length > 0 && (
                <div 
                    className="absolute bg-custom-white dark:bg-custom-blackLight border border-gray-300 shadow-lg z-[9999] w-full max-h-60 overflow-y-auto mt-2 rounded-xl"
                    onScroll={(e) => e.stopPropagation()} // Prevenir que el scroll se propague
                    onTouchMove={(e) => e.stopPropagation()} // Prevenir que el touch se propague en móvil
                >
                    <ul>
                        {predictionResults.map(({ place_id, description }) => {
                            return (
                                <li
                                    key={place_id}
                                    className="hover:bg-custom-gray-default p-2 cursor-pointer dark:hover:text-custom-blackSemi text-left px-2.5"
                                    onClick={() => handleSuggestionClick(place_id)}
                                >
                                    {description}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Autocomplete;