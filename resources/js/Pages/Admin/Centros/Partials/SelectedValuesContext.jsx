import { createContext, useContext, useState } from 'react';

const SelectedValuesContext = createContext();

export const useSelectedValues = () => {
    return useContext(SelectedValuesContext);
};

export const SelectedValuesProvider = ({ children }) => {
    const [selectedValues, setSelectedValues] = useState([]);

    return (
        <SelectedValuesContext.Provider value={{ selectedValues, setSelectedValues }}>
            {children}
        </SelectedValuesContext.Provider>
    );
};