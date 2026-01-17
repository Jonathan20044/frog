import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import { UtensilsCrossed, Users, ChefHat, Building2, Home, Crown, Mountain, GlassWater, Store, CheckCircle, AlertTriangle, DollarSign, Circle } from 'lucide-react';
import { TableCard } from '../components/TableCard';
import InteractiveGuide, { GuideButton, type GuideStep } from '../components/InteractiveGuide';

const iconMap: Record<string, React.ComponentType<any>> = {
  'Building2': Building2,
  'Home': Home,
  'Crown': Crown,
  'Mountain': Mountain,
  'GlassWater': GlassWater,
};

const guideSteps: GuideStep[] = [
  {
    title: '¡Bienvenido a Mesas!',
    description: 'Esta es la pantalla principal donde puedes ver todas las áreas del restaurante y gestionar las mesas. Te mostraré cómo usarla paso a paso.',
    position: 'center',
  },
  {
    title: 'Selecciona un Área',
    description: 'Haz clic en cualquier área del restaurante (Salón Principal, Terraza, VIP, etc.) para ver las mesas disponibles en esa zona.',
    target: 'areas-grid',
    position: 'bottom',
  },
  {
    title: 'Leyenda de Estados',
    description: 'Aquí puedes ver el significado de los colores: Verde = disponible, Naranja = ocupada, Azul = lista para pagar.',
    target: 'legend-section',
    position: 'top',
  },
  {
    title: 'Información de Mesas',
    description: 'En la parte superior verás cuántas mesas están disponibles, ocupadas y listas para pagar en toda el área.',
    target: 'stats-section',
    position: 'bottom',
  },
  {
    title: 'Seleccionar Mesa',
    description: 'Una vez en el área, haz clic en una mesa para: tomar orden (verde), ver orden (naranja), o cobrar (azul).',
    position: 'center',
  },
];

export default function TablesPage() {
  const navigate = useNavigate();
  const { areas, orders, setCurrentTable } = useRestaurant();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

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

  const currentArea = areas.find(a => a.id === selectedArea);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 shadow-2xl border-b-4 border-cyan-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-2xl blur opacity-50"></div>
                <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                  <ChefHat className="w-8 h-8 text-cyan-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-white font-bold text-3xl tracking-tight drop-shadow-lg">
                  FROG Restaurant
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse"></div>
                  <p className="text-cyan-100 text-base font-semibold flex items-center gap-2">
                    {selectedArea ? <><Store className="w-4 h-4" /> {currentArea?.name}</> : <><Home className="w-4 h-4" /> Sistema de Gestión de Mesas</>}
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
            <div className="mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3 flex items-center gap-3">
                <Store className="w-9 h-9 text-cyan-600" />
                Selecciona un Área
              </h2>
              <p className="text-slate-600 text-xl">Haz clic en un área para ver y gestionar sus mesas</p>
            </div>

            {/* Areas Grid */}
            <div id="areas-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {areas.map((area) => {
                const areaOrders = orders.filter(
                  (order) => area.tables.some(t => t.id === order.tableId) && order.status !== 'paid'
                );
                const occupiedTables = area.tables.filter(
                  (table) => getTableStatus(table.id) !== 'disponible'
                ).length;

                const AreaIcon = iconMap[area.icon] || UtensilsCrossed;

                return (
                  <div
                    key={area.id}
                    onClick={() => handleAreaClick(area.id)}
                    className="group relative bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2 hover:scale-105 border-2 border-slate-200 hover:border-cyan-400"
                  >
                    {/* Image with gradient overlay */}
                    <div className="relative h-64 overflow-hidden">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/95 via-blue-800/60 to-transparent"></div>
                      
                      {/* Icon badge */}
                      <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20">
                        <AreaIcon className="size-8 text-cyan-600" strokeWidth={2.5} />
                      </div>

                      {/* Area name */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{area.name}</h3>
                        <div className="flex items-center gap-3 text-cyan-100">
                          <Users className="size-5" />
                          <span className="text-base font-semibold">Total de mesas: {area.tables.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Section */}
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="text-sm text-slate-500 font-bold mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Ocupadas
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-800">{occupiedTables}</span>
                            <span className="text-base text-slate-500 font-medium">mesa{occupiedTables !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-slate-500 font-bold mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Disponibles
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">{area.tables.length - occupiedTables}</span>
                            <span className="text-base text-slate-500 font-medium">mesa{(area.tables.length - occupiedTables) !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status badges */}
                      <div className="flex gap-3">
                        <div className={`flex-1 px-4 py-3 rounded-xl text-center text-sm font-bold shadow-lg border-2 flex items-center justify-center gap-2 ${
                          occupiedTables > 0 
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-300' 
                            : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-300'
                        }`}>
                          {occupiedTables > 0 ? <><AlertTriangle className="w-4 h-4" /> Ocupado</> : <><CheckCircle className="w-4 h-4" /> Sin ocupar</>}
                        </div>
                        <div className={`flex-1 px-4 py-3 rounded-xl text-center text-sm font-bold shadow-lg border-2 ${
                          areaOrders.length > 0 
                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-300' 
                            : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 border-slate-300'
                        }`}>
                          {areaOrders.length > 0 ? `${areaOrders.length} orden${areaOrders.length !== 1 ? 'es' : ''}` : 'Sin órdenes'}
                        </div>
                      </div>

                      {/* View button */}
                      <button className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95 text-lg flex items-center justify-center gap-2">
                        <Store className="w-6 h-6" />
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
            {/* Título de sección */}
            <div id="stats-section" className="mb-10">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3 flex items-center gap-3">
                <Store className="w-9 h-9 text-cyan-600" />
                Mesas - {currentArea?.name}
              </h2>
              <p className="text-slate-600 text-xl">
                Selecciona una mesa para gestionar órdenes y pagos
              </p>
            </div>

            {/* Leyenda de estados */}
            <div id="legend-section" className="bg-gradient-to-r from-white to-slate-50 rounded-2xl shadow-xl border-2 border-slate-200 p-8 mb-10">
              <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 w-1.5 h-6 rounded-full"></span>
                <Circle className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                Estado de Mesas:
              </h3>
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"></div>
                  <span className="text-base text-slate-700 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Disponible
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg"></div>
                  <span className="text-base text-slate-700 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Ocupada
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 to-red-600 shadow-lg"></div>
                  <span className="text-base text-slate-700 font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Por Pagar
                  </span>
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

      {/* Botón de ayuda y guía interactiva */}
      <GuideButton onClick={() => setShowGuide(true)} />
      {showGuide && (
        <InteractiveGuide
          steps={guideSteps}
          onComplete={() => setShowGuide(false)}
          pageName="Gestión de Mesas"
        />
      )}
    </div>
  );
}
