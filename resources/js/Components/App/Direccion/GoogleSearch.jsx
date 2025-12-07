import APIProvider from "@/Components/App/Google/APIProvider";
import Autocomplete from "@/Components/App/Google/Autocomplete";
import Map from "@/Components/App/Google/Map";

/**
 * Generic component for searching addresses using Google Maps API, just create a handler for the selected coordinates without a Google Map
 * 
 * @param {CallableFunction} onSelect Handler for the selected coordinates
 * @param {boolean} showMap Whether to show the map or not
 * @returns 
 */
export default function GoogleSearch({ onSelect, showMap = true, ...props }) {

    const manageSelection = (placeDetails) => {
        if (!onSelect) {
            return;
        }
        onSelect(placeDetails);
    }
    return (
        <APIProvider>
            <Autocomplete onPlaceSelect={manageSelection} {...props} />
            <div className={showMap ? '' : 'hidden'}>
                <Map />
            </div>
        </APIProvider>
    )
}