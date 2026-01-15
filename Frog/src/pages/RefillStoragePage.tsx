import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Droplet, Plus, Minus, Check } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useStorage } from '../context/StorageContext';

interface StorageRoom {
  id: string;
  name: string;
  icon: string;
  items: string[]; // IDs de items que pueden estar en esta recámara
}


export default function RefillStoragePage() {
  const navigate = useNavigate();
  const { inventory } = useInventory();
  const { addRefillRecord } = useStorage();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [waiterName, setWaiterName] = useState('');
  const [refillItems, setRefillItems] = useState<{ itemId: number; quantity: number }[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const storageRooms: StorageRoom[] = [
    {
      id: 'bebidas',
      name: 'Recámara de Bebidas',
      icon: '🥤',
      items: ['bebida']
    },
    {
      id: 'frio',
      name: 'Recámara Fría',
      icon: '❄️',
      items: ['ingrediente']
    },
    {
      id: 'seco',
      name: 'Recámara Seca',
      icon: '📦',
      items: ['ingrediente', 'utensilio']
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                <Droplet className="w-8 h-8" />
                Rellenar Recámaras - FROG
              </h1>
              <p className="text-blue-100">Registro de reabastecimiento de almacenes</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-semibold transition shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!selectedRoom ? (
          // Selección de Recámara
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Selecciona una Recámara</h2>
              <p className="text-slate-600">Elige qué recámara vas a reabastecer</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {storageRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 text-center border-2 border-slate-200 hover:border-blue-500 group"
                >
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                    {room.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{room.name}</h3>
                  <p className="text-slate-500 text-sm">
                    {room.items.map(i => i === 'bebida' ? 'Bebidas' : i === 'ingrediente' ? 'Ingredientes' : 'Utensilios').join(', ')}
                  </p>
                </button>
              ))}
            </div>
          </>
        ) : (
          // Vista de Relleno
          <>
            <button
              onClick={() => setSelectedRoom(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
            >
              <ChevronLeft className="w-5 h-5" />
              Cambiar recámara
            </button>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">{currentRoom?.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{currentRoom?.name}</h2>
                  <p className="text-slate-600">Selecciona los items que rellenaste</p>
                </div>
              </div>

              {/* Campo de nombre de mesera */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tu Nombre (Mesera/o)
                </label>
                <input
                  type="text"
                  value={waiterName}
                  onChange={(e) => setWaiterName(e.target.value)}
                  placeholder="Ej: María González"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none text-lg"
                />
              </div>

              {/* Lista de items disponibles */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 mb-4">Items Disponibles</h3>
                {availableItems.map((item) => {
                  const quantity = getItemQuantity(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        quantity > 0
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <h4 className="font-semibold text-slate-800">{item.name}</h4>
                        <p className="text-sm text-slate-500">
                          Stock actual: {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={quantity === 0}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white w-10 h-10 rounded-lg font-bold transition shadow-sm flex items-center justify-center"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-xl min-w-[60px] text-center text-slate-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-lg font-bold transition shadow-sm flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumen */}
              {refillItems.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-3">Resumen de Relleno</h3>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <ul className="space-y-2">
                      {refillItems.map(ri => {
                        const item = inventory.find(i => i.id === ri.itemId);
                        return (
                          <li key={ri.itemId} className="flex justify-between text-slate-700">
                            <span className="font-medium">{item?.name}</span>
                            <span className="font-bold text-blue-600">+{ri.quantity} {item?.unit}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-6 h-6" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-bounce">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Registro Exitoso!</h2>
            <p className="text-slate-600">
              El relleno de {currentRoom?.name} ha sido registrado correctamente
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
