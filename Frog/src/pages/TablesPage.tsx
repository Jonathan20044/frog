import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import { UtensilsCrossed, Users, ChefHat, ChevronLeft } from 'lucide-react';
import { TableCard } from '../components/TableCard';

export default function TablesPage() {
  const navigate = useNavigate();
  const { areas, orders, setCurrentTable } = useRestaurant();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const getTableStatus = (tableId: number): "disponible" | "ocupada" | "por-pagar" => {
    const tableOrders = orders.filter(
      (order) => order.tableId === tableId && order.status !== 'paid'
    );
    if (tableOrders.length === 0) return 'disponible';
    if (tableOrders.some((order) => order.status === 'preparing')) return 'ocupada';
    return 'por-pagar';
  };

  const handleTableClick = (tableId: number) => {
    setCurrentTable(tableId);
    const status = getTableStatus(tableId);
    
    if (status === 'disponible' || status === 'ocupada') {
      navigate('/menu');
    } else if (status === 'por-pagar') {
      navigate('/payment');
    }
  };

  const handleAreaClick = (areaId: string) => {
    setSelectedArea(areaId);
  };

  const handleBackToAreas = () => {
    setSelectedArea(null);
  };

  const currentArea = areas.find(a => a.id === selectedArea);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo y título */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <ChefHat className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-white font-bold text-2xl tracking-tight">FROG Restaurant</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
                  <p className="text-emerald-50 text-sm font-medium">
                    {selectedArea ? currentArea?.name : 'Sistema de Gestión de Mesas'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedArea ? (
          // Vista de Áreas
          <>
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Selecciona un Área</h2>
              <p className="text-slate-600 text-lg">Haz clic en un área para ver y gestionar sus mesas</p>
            </div>

            {/* Areas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {areas.map((area) => {
                const areaOrders = orders.filter(
                  (order) => area.tables.some(t => t.id === order.tableId) && order.status !== 'paid'
                );
                const occupiedTables = area.tables.filter(
                  (table) => getTableStatus(table.id) !== 'disponible'
                ).length;

                return (
                  <div
                    key={area.id}
                    onClick={() => handleAreaClick(area.id)}
                    className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                  >
                    {/* Image with gradient overlay */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={area.image}
                        alt={area.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop`;
                        }}
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/95 via-emerald-800/60 to-transparent"></div>
                      
                      {/* Icon badge */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                        <UtensilsCrossed className="size-6 text-emerald-600" strokeWidth={2.5} />
                      </div>

                      {/* Area name */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-2xl font-bold text-white mb-1">{area.name}</h3>
                        <div className="flex items-center gap-2 text-emerald-100">
                          <Users className="size-4" />
                          <span className="text-sm font-medium">Total de mesas: {area.tables.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Section */}
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 font-medium mb-1">Ocupadas</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-800">{occupiedTables}</span>
                            <span className="text-sm text-slate-500">mesa{occupiedTables !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 font-medium mb-1">Disponibles</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-emerald-600">{area.tables.length - occupiedTables}</span>
                            <span className="text-sm text-slate-500">mesa{(area.tables.length - occupiedTables) !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status badges */}
                      <div className="flex gap-2">
                        <div className={`flex-1 px-3 py-2 rounded-lg text-center text-sm font-medium ${
                          occupiedTables > 0 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {occupiedTables > 0 ? 'Ocupado' : 'Sin ocupar'}
                        </div>
                        <div className={`flex-1 px-3 py-2 rounded-lg text-center text-sm font-medium ${
                          areaOrders.length > 0 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {areaOrders.length > 0 ? `${areaOrders.length} orden${areaOrders.length !== 1 ? 'es' : ''}` : 'Sin órdenes'}
                        </div>
                      </div>

                      {/* View button */}
                      <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg mt-2">
                        Ver Área
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // Vista de Mesas del Área Seleccionada
          <>
            {/* Botón volver */}
            <button 
              onClick={handleBackToAreas}
              className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-6 group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Volver a Áreas</span>
            </button>

            {/* Título de sección */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Mesas - {currentArea?.name}
              </h2>
              <p className="text-slate-600">
                Selecciona una mesa para gestionar órdenes y pagos
              </p>
            </div>

            {/* Leyenda de estados */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Estado de Mesas:
              </h3>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                  <span className="text-sm text-slate-700">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
                  <span className="text-sm text-slate-700">Ocupada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></div>
                  <span className="text-sm text-slate-700">Por Pagar</span>
                </div>
              </div>
            </div>

            {/* Grid de mesas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentArea?.tables.map((table) => {
                const status = getTableStatus(table.id);
                return (
                  <TableCard 
                    key={table.id}
                    table={{
                      id: table.id,
                      name: `Mesa ${table.id}`,
                      status: status,
                      capacity: table.capacity
                    }}
                    onClick={() => handleTableClick(table.id)}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
