import { useCallback, useContext, useEffect, createContext, useState, useRef } from "react";
import axios from 'axios';
import { toast } from "sonner";
import { useApproval } from '../Hooks/useApproval';
import { ViewContextProvider } from './ViewContext';

/**
 * Contexto para manejar datos con cache automático
 * @type {React.Context}
 */
const DataHandlerContext = createContext(null);

/**
 * Hook personalizado para acceder al contexto
 * @throws {Error} Si se usa fuera del DataHandlerContextProvider
 * @returns {Object} Valores y funciones del contexto
 */
function useDataHandler() {
  const context = useContext(DataHandlerContext);
  if (!context) {
    throw new Error('useDataHandler debe usarse dentro de DataHandlerContextProvider');
  }
  return context;
}

/**
 * Proveedor del contexto con cache automático y transparente
 */
const DataHandlerContextProvider = ({ children }) => {
  
  const { processApproval, isProcessing: isProcessingApproval } = useApproval();
  
  // Ref para trackear si ya se hizo la carga inicial
  const hasInitialLoadRef = useRef(false);

  // Mapeo de tipos de aprobación para UI - usando los valores exactos del backend
  const approvalTypeMap = {
    'manager': { label: 'Manager de departamento', icon: 'UserCheck', order: 1 },
    'hr': { label: 'Recursos Humanos', icon: 'Users', order: 2 },
    'direction': { label: 'Dirección', icon: 'Crown', order: 3 }
  };

  // Estados globales de datos con cache automático
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);
  const [userApprovalTypes, setUserApprovalTypes] = useState([]);
  const [approvalTypes, setApprovalTypes] = useState([]);

  // Estados de formulario y vista
  const [currentFormModel, setCurrentFormModel] = useState(null);
  const [isFormProcessing, setIsFormProcessing] = useState(false);
  const [formError, setFormError] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Estados de vista para crear/actualizar, hoja y eliminar
  const [viewStates, setViewStates] = useState({
    createUpdate: { open: false, model: null },
    sheet: { open: false, model: null },
    delete: { open: false, model: null }
  });

  /**
   * Obtiene todos los datos desde la API automáticamente
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(route('api.v1.admin.solicitudes.index'));
      
      if (response.status === 200) {
        const validSolicitudes = (response.data.solicitudes || []).filter(
          solicitud => solicitud && solicitud.id !== undefined
        );
        setData(validSolicitudes);
        setUserApprovalTypes(response.data.user_approval_types || []);
        setApprovalTypes(response.data.approval_types || []);
        hasInitialLoadRef.current = true;
      } else {
        setData([]);
        hasInitialLoadRef.current = true;
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setData([]);
      hasInitialLoadRef.current = true;
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para evitar bucles

  /**
   * Actualiza automáticamente los datos cuando se detectan cambios
   */
  const refreshDataOnChange = useCallback(() => {
    setDataVersion(prev => prev + 1);
    fetchData(); // Recargar datos automáticamente
  }, []); 

  /**
   * Actualiza o agrega un elemento y refresca automáticamente
   */
  const updateData = useCallback((newItem) => {
    if (!newItem || newItem.id === undefined) {
      console.error('updateData: newItem is invalid', newItem);
      return;
    }

    setData(prevData => {
      const validData = prevData.filter(item => item && item.id !== undefined);
      const existingItemIndex = validData.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex !== -1) {
        // Actualizar item existente
        return prevData.map(item => 
          item && item.id === newItem.id ? newItem : item
        );
      } else {
        // Agregar nuevo item al principio
        return [newItem, ...validData];
      }
    });
    
    // Refresh automático después de un delay corto (sin dependencias)
    setTimeout(() => {
      setDataVersion(prev => prev + 1);
    }, 100);
  }, []); // Sin dependencias para evitar bucles

  /**
   * Elimina un elemento y refresca automáticamente
   */
  const deleteItem = useCallback((id) => {
    setData(prevData => prevData.filter(item => item && item.id !== id));
    
    // Refresh automático después de un delay corto (sin dependencias)
    setTimeout(() => {
      setDataVersion(prev => prev + 1);
    }, 100);
  }, []); // Sin dependencias para evitar bucles

  /**
   * Actualiza el estado de una solicitud específica
   */
  const updateSolicitudStatus = useCallback((solicitudId, newStatus) => {
    setData(prevData => {
      return prevData.map(item => {
        if (item && item.id === solicitudId) {
          return {
            ...item,
            estado: newStatus,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      });
    });
    
    // Refresh automático después de un delay corto
    setTimeout(refreshDataOnChange, 100);
  }, [refreshDataOnChange]);

  //Funcioens de vista
  const setViewState = useCallback((viewKey, newState) => {
    setViewStates(prev => ({
      ...prev,
      [viewKey]: { ...prev[viewKey], ...newState }
    }));
  }, []);

  const handleCreateView = useCallback(() => {
    setCurrentFormModel(null);
    setViewState('createUpdate', { open: true, model: null });
  }, [setViewState]);

  const handleUpdateView = useCallback((model) => {
    if (!model || !model.id) {
      console.error('handleUpdateView: model is invalid', model);
      return;
    }
    
    setCurrentFormModel(model);
    setViewState('createUpdate', { open: true, model: model });
  }, [setViewState]);

  const handleSheetView = useCallback((model) => {
    if (!model || !model.id) {
      console.error('handleSheetView: model is invalid', model);
      return;
    }
    setViewState('sheet', { open: true, model: model });
  }, [setViewState]);

  const handleDeleteView = useCallback((model) => {
    if (!model || !model.id) {
      console.error('handleDeleteView: model is invalid', model);
      return;
    }
    setViewState('delete', { open: true, model: model });
  }, [setViewState]);

  const closeAllViews = useCallback(() => {
    setViewStates({
      createUpdate: { open: false, model: null },
      sheet: { open: false, model: null },
      delete: { open: false, model: null }
    });
    setCurrentFormModel(null);
  }, []);

  //Funciones de formulario CRUD
  const handleSubmit = useCallback(async (formDataToSubmit) => {
    setIsFormProcessing(true);
    setFormError(false);

    try {
      const endpoint = currentFormModel ? 
        route('api.v1.admin.solicitudes.update', currentFormModel.id) :
        route('api.v1.admin.solicitudes.store');
      
      const method = currentFormModel ? 'patch' : 'post';
      
      const response = await axios[method](endpoint, formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(currentFormModel ? 'Solicitud actualizada correctamente' : 'Solicitud creada correctamente');
        
        if (response.data?.solicitud) {
          updateData(response.data.solicitud);
        } else {
          refreshDataOnChange();
        }
        
        closeAllViews();
        return true;
      }
    } catch (error) {
      console.error('Error en el formulario:', error);
      setFormError(true);
      toast.error('Error al procesar la solicitud');
      return false;
    } finally {
      setIsFormProcessing(false);
    }
  }, [currentFormModel, updateData, refreshDataOnChange, closeAllViews]);

  const handleDelete = useCallback(async (model) => {
    if (!model || !model.id) {
      console.error('handleDelete: model is invalid', model);
      return false;
    }

    setIsFormProcessing(true);
    setFormError(false);

    try {
      const response = await axios.delete(route('api.v1.admin.solicitudes.destroy', model.id));
      
      if (response.status === 200) {
        toast.success('Solicitud eliminada correctamente');
        deleteItem(model.id);
        closeAllViews();
        return true;
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      setFormError(true);
      toast.error('Error al eliminar la solicitud');
      return false;
    } finally {
      setIsFormProcessing(false);
    }
  }, [deleteItem, closeAllViews]);


  //Functiones de dropdown/aprobación
  /**
   * Maneja las acciones del dropdown de aprobación/denegación
   * @param {Object|string} model - Modelo de la solicitud o ID
   * @param {string} tipo - Tipo de aprobación (Direccion, RRHH, Administrador)
   * @param {string} accion - Acción a realizar (aprobar, denegar)
   * @param {string} observaciones - Observaciones o comentarios
   */
  const handleDropdownAction = useCallback(async (model, tipo, accion, observaciones = null) => {
    const solicitudId = model.id || model;
    
    try {
      const success = await processApproval(
        solicitudId, 
        tipo, 
        accion, 
        observaciones,
        (data) => {
          // Callback de éxito - actualizar solo el item específico sin mostrar skeleton
          if (data && data.solicitud) {
            updateData(data.solicitud);
          }
        }
      );
      
      return { success };
    } catch (error) {
      console.error('Error en handleDropdownAction:', error);
      return { success: false };
    }
  }, [processApproval, updateData]);

  /**
   * Helper function para obtener información de un tipo de aprobación
   */
  const getApprovalTypeInfo = useCallback((approvalType) => {
    return approvalTypeMap[approvalType] || { 
      label: approvalType, 
      icon: 'User', 
      order: 999 
    };
  }, []);

  /**
   * Helper function para verificar si el usuario puede aprobar con un tipo específico
   */
  const canApproveAs = useCallback((approvalType) => {
    return userApprovalTypes.includes(approvalType);
  }, [userApprovalTypes]);

  
  useEffect(() => {
    // Solo cargar datos automáticamente si nunca se han cargado
    if (!hasInitialLoadRef.current) {
      fetchData();
    }
  }, []); // Sin dependencias para evitar bucles infinitos

  //Contexto del proveedor
  const contextValue = {
    // Estados de datos
    data,
    loading,
    dataVersion,
    userApprovalTypes,
    approvalTypes,
    approvalTypeMap,
    
    // Funciones de datos (automáticas)
    fetchData,
    updateData,
    deleteItem,
    updateSolicitudStatus,
    
    // Estados de formulario
    currentFormModel,
    isFormProcessing,
    formError,
    isFormLoading,
    
    // Estados de vista
    viewStates,
    
    // Funciones de vista
    handleCreateView,
    handleUpdateView,
    handleSheetView,
    handleDeleteView,
    closeAllViews,
    
    // Funciones de formulario
    handleSubmit,
    handleDelete,
    
    // Funciones de aprobación
    processApproval,
    isProcessingApproval,
    handleDropdownAction,
    
    // Helper functions para aprobaciones
    getApprovalTypeInfo,
    canApproveAs,
  };

  return (
    <DataHandlerContext.Provider value={contextValue}>
      <ViewContextProvider>
        {children}
      </ViewContextProvider>
    </DataHandlerContext.Provider>
  );
};

export { DataHandlerContextProvider, useDataHandler };
