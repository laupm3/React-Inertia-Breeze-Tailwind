import { APIProvider as GoogleAPIProvider } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? null;
const APP_ENV = import.meta.env.APP_ENV ?? 'local';

/**
 * Wrapper for the Google Maps API provider
 * 
 * @returns {JSX.Element}
 */
export default function APIProvider({ children }) {

    if (!API_KEY) {
        return (APP_ENV !== 'development'
            ?
            <div>
                <h1>API Key Required</h1>
                <p>
                    This example requires a valid Google Maps API key. Please set the
                    environment variable VITE_GOOGLE_MAPS_API_KEY to a valid key.
                </p>
            </div>
            :
            <h1>Error loading Google Component</h1>
        );
    }

    return (
        <GoogleAPIProvider apiKey={API_KEY}>
            {children}
        </GoogleAPIProvider>
    );
};