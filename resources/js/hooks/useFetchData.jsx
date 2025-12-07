import { useState, useEffect } from "react";
import axios from "axios";

// Hook useFetchData
// Este Hook se encarga de realizar una petición GET a una URL y devuelve el resultado de la petición, el estado de carga y un posible error.
export function useFetchData(fetchUrl, initialData = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(fetchUrl);
        if (response.status === 200) {
          setData(response.data);
        } else {
          setError(new Error("API returned non-200 status"));
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUrl]);

  return { data, loading, error };
}

export default useFetchData;