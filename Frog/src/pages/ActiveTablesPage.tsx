import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, UtensilsCrossed, MapPin, MessageSquare, Home, Sparkles } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import type { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react';
import InteractiveGuide, { GuideButton, type GuideStep } from '../components/InteractiveGuide';

const guideSteps: GuideStep[] = [
  {
    title: 'Vista de Mesas Activas',
    description: 'Esta pantalla te muestra todas las mesas que tienen órdenes activas en todo el restaurante.',
    position: 'center',
  },
  {
    title: 'Información de la Mesa',
    description: 'Cada tarjeta muestra la ubicación, estado de la orden, items pedidos y tiempo transcurrido.',
    target: 'tables-grid',
    position: 'bottom',
  },
  {
    title: 'Estados de Orden',
    description: 'Verde = En preparación en cocina. Naranja = Lista para servir.',
    position: 'center',
  },
  {
    title: 'Acciones Rápidas',
    description: 'Haz clic en "Ver Mesa" para ir al menú y agregar más items, o "Pagar" para procesar el pago.',
    position: 'center',
  },
];

export default function ActiveTablesPage() {
  const navigate = useNavigate();
  const { areas, orders } = useRestaurant();
  const [showGuide, setShowGuide] = useState(false);

  // Obtener información de mesas activas
  const getActiveTableInfo = () => {
    const activeTables = orders
      .filter(order => order.status !== 'paid')
      .map(order => {
        const area = areas.find(a => a.tables.some(t => t.id === order.tableId));
        return {
          tableId: order.tableId,
          areaName: area?.name || 'Desconocida',
          status: order.status,
          total: order.total,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          items: order.items,
          timestamp: order.timestamp
        };
      });
    
    // Agrupar por mesa
    const tableMap = new Map();
    activeTables.forEach(table => {
      if (tableMap.has(table.tableId)) {
        const existing = tableMap.get(table.tableId);
        existing.total += table.total;
        existing.itemCount += table.itemCount;
        existing.items = [...existing.items, ...table.items];
      } else {
        tableMap.set(table.tableId, { ...table });
      }
    });
    
    return Array.from(tableMap.values()).sort((a, b) => a.tableId - b.tableId);
  };

  const activeTables = getActiveTableInfo();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'preparing':
        return { text: 'Cocinando', color: 'bg-orange-100 text-orange-700 border-orange-300' };
      case 'ready':
        return { text: 'Lista', color: 'bg-green-100 text-green-700 border-green-300' };
      default:
        return { text: 'Pendiente', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    }
  };

  const getTimeElapsed = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 shadow-2xl border-b-4 border-cyan-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl blur opacity-50"></div>
              <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                <Users className="w-8 h-8 text-cyan-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-white font-bold text-3xl tracking-tight drop-shadow-lg">
                Mesas Activas
              </h1>
              <p className="text-cyan-100 text-base font-semibold mt-1 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {activeTables.length} mesa{activeTables.length !== 1 ? 's' : ''} en servicio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTables.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl p-16 text-center border-2 border-slate-200">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-xl opacity-30"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                <Users className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">No hay mesas activas</h2>
            <p className="text-slate-600 mb-8 text-lg flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6" />
              Todas las mesas están disponibles en este momento
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105"
            >
              Ir a Mesas
            </button>
          </div>
        ) : (
          <div id="tables-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTables.map((table) => {
              const statusInfo = getStatusInfo(table.status);
              
              return (
                <div
                  key={table.tableId}
                  className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 overflow-hidden border-2 border-slate-200 hover:border-cyan-400 flex flex-col h-[600px] transform hover:scale-105"
                >
                  {/* Header de la tarjeta */}
                  <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-teal-600 p-6 flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-3xl font-bold text-white drop-shadow-lg">Mesa {table.tableId}</h3>
                          <p className="text-cyan-100 text-sm font-semibold flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {table.areaName}
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-xs font-bold border-2 shadow-lg ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-3 py-2 rounded-lg inline-flex">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeElapsed(table.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contenido de la tarjeta */}
                  <div className="p-6 flex-1 flex flex-col overflow-hidden">
                    {/* Resumen */}
                    <div className="mb-6 bg-gradient-to-r from-cyan-50 via-blue-50 to-teal-50 p-4 rounded-xl border-2 border-cyan-200 flex-shrink-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-cyan-600 to-blue-600 p-2 rounded-lg">
                            <UtensilsCrossed className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-slate-700 flex items-center gap-2">
                            <UtensilsCrossed className="w-5 h-5" />
                            {table.itemCount} platillos
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 mb-1 font-semibold">Total</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">₡{table.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Lista de platillos con scroll */}
                    <div className="border-t-2 border-slate-200 pt-4 flex-1 overflow-hidden flex flex-col">
                      <p className="text-sm font-bold text-slate-700 mb-4 uppercase flex-shrink-0 flex items-center gap-2">
                        <span className="bg-gradient-to-r from-cyan-600 to-blue-600 w-1 h-4 rounded-full"></span>
                        Pedido
                      </p>
                      <div className="space-y-3 overflow-y-auto flex-1 pr-2" style={{ scrollbarWidth: 'thin' }}>
                        {table.items.map((item: { name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; selectedOptions: { [s: string]: unknown; } | ArrayLike<unknown>; notes: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; quantity: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; price: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: Key | null | undefined) => (
                          <div key={index} className="flex justify-between items-start bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border-2 border-slate-200 hover:border-cyan-300 transition-all shadow-md hover:shadow-lg">
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 text-base">{item.name}</p>
                              {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {Object.values(item.selectedOptions).map((opt, i) => (
                                    <span key={i} className="text-xs font-semibold bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 px-3 py-1 rounded-full border border-cyan-300">
                                      {String(opt)}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {item.notes && (
                                <p className="text-xs text-amber-700 italic mt-2 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  "{item.notes}"
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-3">
                              <div className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white px-3 py-1 rounded-lg font-bold mb-1">
                                ×{item.quantity}
                              </div>
                              <p className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">₡{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <button
                      onClick={() => navigate('/')}
                      className="w-full mt-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-cyan-500/50 flex-shrink-0 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Home className="w-6 h-6" />
                      Ver en Mesas
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón de ayuda y guía interactiva */}
      <GuideButton onClick={() => setShowGuide(true)} />
      {showGuide && (
        <InteractiveGuide
          steps={guideSteps}
          onComplete={() => setShowGuide(false)}
          pageName="Mesas Activas"
        />
      )}
    </div>
  );
}
