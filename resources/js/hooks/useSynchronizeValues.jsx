import { useState, useEffect } from "react";

//Hook useSynchronizeValues
//Este Hook se encarga de sincronizar los valores de un formulario con los valores de una petición GET.
export function useSynchronizeValues(initialValues, fetchData) {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    if (fetchData) {
      setValues(fetchData);
    }
  }, [fetchData]);

  return { values, setValues };
}

export default useSynchronizeValues;