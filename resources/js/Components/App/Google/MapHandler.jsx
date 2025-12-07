import { useMap } from '@vis.gl/react-google-maps';
import { useEffect, memo } from 'react';

/**
 * 
 * 
 * @param {Object} props 
 * @param {Object} props.place
 * @returns 
 */
const MapHandler = ({ place }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !place) return;

        if (place.geometry?.viewport) {
            map.fitBounds(place.geometry?.viewport);
        }
    }, [map, place]);

    return null;
};

export default memo(MapHandler);