import { Map as GoogleMap } from '@vis.gl/react-google-maps';

/**
 * Render a Google Map component
 * 
 * @param {Object} props
 * @param {Number} props.defaultZoom The default zoom level
 * @param {Object} props.defaultCenter The default center of the map
 *  
 * @returns {JSX.Element}
 */
export default function Map({ defaultZoom = 3, defaultCenter = { lat: 22.54992, lng: 0 } }) {
    return (
        <GoogleMap
            defaultZoom={3}
            defaultCenter={{ lat: 22.54992, lng: 0 }}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
        />
    )
}