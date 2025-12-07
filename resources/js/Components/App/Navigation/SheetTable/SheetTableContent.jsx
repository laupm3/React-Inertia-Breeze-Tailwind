import { TableCell } from './Components/TableCell';
import { GridCell } from './Components/GridCell';
import WeightIndicator from '@/Components/App/Navigation/WeightIndicator';
import Icon from "@/imports/LucideIcon";

function SheetTableContent({ data, allNavigationData = [] }) {
  // Función para construir la jerarquía completa del elemento actual
  const buildHierarchy = (currentItem, allData = []) => {
    // Función recursiva para obtener los padres
    const getParentChain = (item) => {
      if (!item.parent_id) return [item];
      
      // Buscar el padre en allData 
      const parent = allData.find(d => d.id === item.parent_id);
      
      if (parent) {
        return [...getParentChain(parent), item];
      } else {
        const parentPlaceholder = {
          id: item.parent_id,
          name: 'Elemento padre',
          icon: 'Folder'
        };
        return [parentPlaceholder, item];
      }
    };
    
    return getParentChain(currentItem);
  };

  const hierarchy = buildHierarchy(data, allNavigationData);

  return (
    <div className="flex flex-col space-y-6">
      {/* Título Principal */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-custom-orange mb-2">
          {data.name}
        </h1>
      </div>

      {/* Mapa de Navegación - Mostrar jerarquía completa */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-custom-gray-semiDark dark:text-white mb-4">
          Mapa
        </h2>
        
        <div className="space-y-2">
          {/* Mostrar la jerarquía completa dinámicamente */}
          {hierarchy.map((item, index) => (
            <div 
              key={item.id} 
              className="flex items-center gap-2"
              style={{ marginLeft: `${index * 16}px` }}
            >
              {index > 0 && (
                <Icon name="CornerDownRight" className="w-4 h-4 text-gray-400" />
              )}
              <Icon 
                name={item.icon || (index === 0 ? 'Folder' : 'FileText')} 
                className="w-4 h-4 text-custom-orange" 
              />
              <span 
                className={`text-sm ${
                  item.id === data.id 
                    ? 'text-custom-orange font-semibold' 
                    : 'text-custom-gray-semiDark dark:text-gray-300'
                }`}
              >
                {item.name}
              </span>
            </div>
          ))}
          
          {/* Si hay hijos del elemento actual, mostrarlos */}
          {data.children && data.children.length > 0 && data.children.map((child, index) => (
            <div 
              key={child.id} 
              className="flex items-center gap-2"
              style={{ marginLeft: `${hierarchy.length * 16}px` }}
            >
              <Icon name="CornerDownRight" className="w-4 h-4 text-gray-400" />
              <Icon name={child.icon || 'FileText'} className="w-4 h-4 text-custom-orange" />
              <span className="text-sm text-custom-gray-semiDark dark:text-gray-300">{child.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Información Principal usando Grid Layout */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-custom-gray-semiDark dark:text-white mb-4">
          Información
        </h2>
        
        <div className="grid grid-cols-2 rounded-[20px] overflow-hidden border-2 border-custom-gray-default dark:border-custom-gray-darker/50">
          <GridCell 
            label="Nombre" 
            value={data.name} 
            isHeader={true}
          />
          
          <GridCell 
            label="Icono" 
            value={
              <div className="flex items-center gap-2">
                <Icon name={data.icon || 'MapPin'} className="w-5 h-5 text-custom-orange" />
                <span>{data.icon || 'MapPin'}</span>
              </div>
            }
            isHeader={false}
          />
          
          <GridCell 
            label="Descripción" 
            value={data.description || 'Página de bienvenida para integrar a los nuevos colaboradores en nuestra aplicación de recursos humanos.'}
          />
          
          <GridCell 
            label="Padre" 
            value={data.parent_id ? `ID: ${data.parent_id}` : 'Ninguno'}
          />
          
          <GridCell 
            label="Permisos" 
            value={data.permission ? data.permission.name : 'Usuario'}
          />
          
          <GridCell 
            label="¿Es importante?" 
            value={
              <span className={data.is_important ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {data.is_important ? 'Sí' : 'No'}
              </span>
            }
          />
          
          <GridCell 
            label="¿Es reciente?" 
            value={
              <span className={data.is_recent ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {data.is_recent ? 'Sí' : 'No'}
              </span>
            }
          />
          
          <GridCell 
            label="Peso" 
            value={<WeightIndicator weight={data.weight} />}
            isLast={true}
          />
          
          <GridCell 
            label="Fecha de creación" 
            value={new Date(data.created_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
            isLast={true}
          />
        </div>
      </div>
    </div>
  )
}

export default SheetTableContent