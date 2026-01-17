import { useState } from 'react';
import { ChevronLeft, Droplet, Plus, Minus, Check, Coffee, Beer, User } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useStorage } from '../context/StorageContext';

interface StorageRoom {
  id: string;
  name: string;
  icon: string;
  items: string[]; // IDs de items que pueden estar en esta recámara
}


export default function RefillStoragePage() {
  const { inventory } = useInventory();
  const { addRefillRecord } = useStorage();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [waiterName, setWaiterName] = useState('');
  const [refillItems, setRefillItems] = useState<{ itemId: number; quantity: number }[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const storageRooms: StorageRoom[] = [
    {
      id: 'bebidas-frias',
      name: 'Recámara de Bebidas Frías',
      icon: 'Coffee',
      items: ['bebida']
    },
    {
      id: 'cervezas',
      name: 'Recámara de Cervezas y Vinos',
      icon: 'Beer',
      items: ['bebida']
    }
  ];

  const currentRoom = storageRooms.find(r => r.id === selectedRoom);
  const availableItems = inventory.filter(item => 
    currentRoom?.items.includes(item.category)
  );

  const handleQuantityChange = (itemId: number, change: number) => {
    setRefillItems(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        const newQuantity = Math.max(0, existing.quantity + change);
        if (newQuantity === 0) {
          return prev.filter(i => i.itemId !== itemId);
        }
        return prev.map(i => 
          i.itemId === itemId ? { ...i, quantity: newQuantity } : i
        );
      } else if (change > 0) {
        return [...prev, { itemId, quantity: change }];
      }
      return prev;
    });
  };

  const getItemQuantity = (itemId: number) => {
    return refillItems.find(i => i.itemId === itemId)?.quantity || 0;
  };

  const handleSubmit = () => {
    if (!waiterName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    if (refillItems.length === 0) {
      alert('Selecciona al menos un item para rellenar');
      return;
    }
//Preparar los items con sus nombres para el registro
    const itemsWithNames = refillItems.map(ri => {
      const item = inventory.find(i => i.id === ri.itemId);
      return {
        itemId: ri.itemId,
        itemName: item?.name || '',
        quantity: ri.quantity,
        unit: item?.unit || ''
      };
    });

    // Guardar en el contexto
    addRefillRecord({
      storageRoom: currentRoom?.name || '',
      itemsRefilled: itemsWithNames,
      waiter: waiterName
    });

    setShowConfirmation(true);
    
    setTimeout(() => {
      setShowConfirmation(false);
      setSelectedRoom(null);
      setWaiterName('');
      setRefillItems([]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 shadow-2xl border-b-4 border-blue-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-2xl blur opacity-50"></div>
                <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                  <Droplet className="w-8 h-8 text-cyan-600" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                  Rellenar Recámaras
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-300 animate-pulse"></div>
                  <p className="text-cyan-100 text-base font-semibold">Registro de reabastecimiento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!selectedRoom ? (
          // Selección de Recámara
          <>
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Selecciona una Recámara</h2>
              <p className="text-slate-600 text-lg">Elige qué recámara vas a reabastecer hoy</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {storageRooms.map((room, index) => {
                const RoomIcon = room.icon === 'Coffee' ? Coffee : Beer;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-10 text-center border-2 border-transparent hover:border-cyan-500 group relative overflow-hidden transform hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 flex items-center justify-center">
                        <RoomIcon className="w-20 h-20 text-cyan-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-cyan-600 transition-colors">{room.name}</h3>
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse"></div>
                        <p className="text-cyan-800 text-sm font-semibold">
                          {room.items.map(i => i === 'bebida' ? 'Bebidas y Licores' : i === 'ingrediente' ? 'Ingredientes' : 'Utensilios').join(', ')}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          // Vista de Relleno
          <>
            <button
              onClick={() => setSelectedRoom(null)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-cyan-600 hover:text-cyan-700 px-4 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all mb-8 border-2 border-cyan-200"
            >
              <ChevronLeft className="w-5 h-5" />
              Cambiar recámara
            </button>

            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-2 border-cyan-100">
              <div className="flex items-center gap-6 mb-8 pb-6 border-b-2 border-cyan-100">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-3xl blur opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-3xl shadow-lg flex items-center justify-center">
                    {currentRoom?.icon === 'Coffee' ? <Coffee className="w-20 h-20 text-cyan-600" /> : <Beer className="w-20 h-20 text-cyan-600" />}
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{currentRoom?.name}</h2>
                  <p className="text-slate-600 text-lg mt-2">Selecciona los items que rellenaste</p>
                </div>
              </div>

              {/* Campo de nombre de mesera */}
              <div className="mb-8 pb-8 border-b-2 border-slate-100">
                <label className="block text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                    <User className="w-4 h-4" />
                  </div>
                  Tu Nombre (Mesera/o)
                </label>
                <input
                  type="text"
                  value={waiterName}
                  onChange={(e) => setWaiterName(e.target.value)}
                  placeholder="Ej: María González"
                  className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 focus:outline-none text-lg font-medium transition-all shadow-sm hover:shadow-md"
                />
              </div>

              {/* Lista de items disponibles */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Droplet className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Items Disponibles</h3>
                </div>
                {availableItems.map((item) => {
                  const quantity = getItemQuantity(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 ${
                        quantity > 0
                          ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-400 shadow-lg scale-105'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-md'
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-slate-800 mb-1">{item.name}</h4>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            item.quantity <= item.minStock ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                          }`}></div>
                          <p className="text-sm font-medium text-slate-600">
                            Stock actual: <span className="font-bold text-cyan-600">{item.quantity} {item.unit}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={quantity === 0}
                          className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-slate-300 disabled:to-slate-400 text-white w-12 h-12 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center hover:scale-110 active:scale-95"
                        >
                          <Minus className="w-6 h-6" />
                        </button>
                        <div className="min-w-[80px] text-center">
                          <span className="font-bold text-3xl text-slate-800 block">
                            {quantity}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">{item.unit}</span>
                        </div>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white w-12 h-12 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 active:scale-95"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumen */}
              {refillItems.length > 0 && (
                <div className="mt-8 pt-8 border-t-2 border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Resumen de Relleno</h3>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 rounded-2xl p-6 mb-6 border-2 border-cyan-200 shadow-lg">
                    <ul className="space-y-3">
                      {refillItems.map(ri => {
                        const item = inventory.find(i => i.id === ri.itemId);
                        return (
                          <li key={ri.itemId} className="flex justify-between items-center bg-white rounded-xl p-4 shadow-md">
                            <span className="font-bold text-lg text-slate-800">{item?.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-md">
                                +{ri.quantity} {item?.unit}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95"
                  >
                    <Check className="w-7 h-7" />
                    Confirmar Relleno
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center animate-bounce">
            <div className="relative mx-auto mb-6 w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">¡Registro Exitoso!</h2>
            <p className="text-slate-600 text-lg">
              El relleno de <span className="font-bold text-cyan-600">{currentRoom?.name}</span> ha sido registrado correctamente
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-slate-500 font-medium">Guardando datos...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
