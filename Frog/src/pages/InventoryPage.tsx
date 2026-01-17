import { useState } from 'react';
import { Plus, AlertTriangle, Package, Minus, Trash2, Leaf, Coffee, Utensils, BarChart3, CircleDot, X, Ruler } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function InventoryPage() {
  const { inventory, updateInventoryQuantity, addInventoryItem, removeInventoryItem, getLowStockItems } = useInventory();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'ingrediente' as 'ingrediente' | 'bebida' | 'utensilio',
    quantity: 0,
    unit: '',
    minStock: 0,
  });

  const categories = [
    { id: 'all', name: 'Todo', icon: Package },
    { id: 'ingrediente', name: 'Ingredientes', icon: Leaf },
    { id: 'bebida', name: 'Bebidas', icon: Coffee },
    { id: 'utensilio', name: 'Utensilios', icon: Utensils },
  ];

  const filteredInventory =
    selectedCategory === 'all'
      ? inventory
      : inventory.filter((item) => item.category === selectedCategory);

  const lowStockItems = getLowStockItems();

  const handleAddItem = () => {
    if (!newItem.name || !newItem.unit || newItem.quantity < 0 || newItem.minStock < 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }
    addInventoryItem(newItem);
    setNewItem({
      name: '',
      category: 'ingrediente',
      quantity: 0,
      unit: '',
      minStock: 0,
    });
    setShowAddModal(false);
    alert('¡Item agregado al inventario!');
  };

  const handleUpdateQuantity = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(0, currentQuantity + change);
    updateInventoryQuantity(id, newQuantity);
  };

  const getStockStatus = (item: typeof inventory[0]) => {
    if (item.quantity === 0) return { color: 'bg-red-100 border-red-500', text: 'text-red-700', status: 'Agotado' };
    if (item.quantity <= item.minStock) return { color: 'bg-yellow-100 border-yellow-500', text: 'text-yellow-700', status: 'Stock Bajo' };
    return { color: 'bg-green-100 border-green-500', text: 'text-green-700', status: 'Stock OK' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                  Inventario - FROG
                </h1>
                <p className="text-cyan-100 text-base flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Gestión de Ingredientes y Bebidas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alertas de Stock Bajo */}
        {lowStockItems.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-l-8 border-amber-500 p-6 mb-8 rounded-2xl shadow-xl">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-3 rounded-xl mr-4">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                {lowStockItems.length} producto{lowStockItems.length !== 1 ? 's' : ''} con stock bajo
              </h3>
            </div>
            <div className="ml-16 flex flex-wrap gap-3">
              {lowStockItems.map((item) => (
                <span
                  key={item.id}
                  className="bg-gradient-to-r from-amber-200 to-orange-200 text-amber-900 px-4 py-2 rounded-xl text-sm font-bold shadow-lg border-2 border-amber-300"
                >
                  {item.name} ({item.quantity} {item.unit})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex gap-3 flex-wrap">
            {categories.map((cat) => {
              const Icon = typeof cat.icon === 'string' ? null : cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold transition-all transform ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 text-white shadow-xl scale-110'
                      : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-slate-200 hover:border-cyan-300'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {cat.name}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold shadow-2xl transition-all hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-6 h-6" />
            Agregar Item
          </button>
        </div>

        {/* Tabla de Inventario */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600">
                <tr>
                  <th className="px-6 py-5 text-left font-bold text-white text-lg">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Producto
                    </div>
                  </th>
                  <th className="px-6 py-5 text-left font-bold text-white text-lg">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Categoría
                    </div>
                  </th>
                  <th className="px-6 py-5 text-center font-bold text-white text-lg">
                    <div className="flex items-center justify-center gap-2">
                      <Package className="w-5 h-5" />
                      Cantidad
                    </div>
                  </th>
                  <th className="px-6 py-5 text-center font-bold text-white text-lg">
                    <div className="flex items-center justify-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Stock Mínimo
                    </div>
                  </th>
                  <th className="px-6 py-5 text-center font-bold text-white text-lg">
                    <div className="flex items-center justify-center gap-2">
                      <CircleDot className="w-5 h-5" />
                      Estado
                    </div>
                  </th>
                  <th className="px-6 py-5 text-center font-bold text-white text-lg">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => {
                  const status = getStockStatus(item);
                  return (
                    <tr
                      key={item.id}
                      className={`border-b-2 border-slate-100 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold text-lg text-slate-800">{item.name}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-block bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold border-2 border-slate-300 flex items-center gap-2 w-fit">
                          {item.category === 'ingrediente' && <><Leaf className="w-4 h-4" /> Ingrediente</>}
                          {item.category === 'bebida' && <><Coffee className="w-4 h-4" /> Bebida</>}
                          {item.category === 'utensilio' && <><Utensils className="w-4 h-4" /> Utensilio</>}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white w-11 h-11 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 flex items-center justify-center"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="font-bold text-xl min-w-[100px] text-slate-800">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white w-11 h-11 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 flex items-center justify-center"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-bold text-lg text-slate-700">
                          {item.minStock} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`inline-block px-5 py-2 rounded-xl text-sm font-bold ${status.color} ${status.text} border-2 shadow-lg`}
                        >
                          {status.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar "${item.name}" del inventario?`)) {
                              removeInventoryItem(item.id);
                            }
                          }}
                          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto transform hover:scale-110 active:scale-95"
                        >
                          <Trash2 className="w-5 h-5" />
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-cyan-600 to-blue-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Package className="w-12 h-12 text-white" />
              </div>
              <p className="text-slate-500 text-xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6" />
                No hay items en esta categoría
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Agregar Item */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl p-10 max-w-lg w-full border-2 border-slate-200">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-8 flex items-center gap-3">
              <Plus className="w-8 h-8 text-cyan-600" />
              Agregar Nuevo Item
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-base font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-5 py-3 border-2 border-slate-300 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-200 focus:outline-none transition-all shadow-sm"
                  placeholder="Ej: Tomates"
                />
              </div>
              <div>
                <label className="block text-base font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Categoría
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      category: e.target.value as 'ingrediente' | 'bebida' | 'utensilio',
                    })
                  }
                  className="w-full px-5 py-3 border-2 border-slate-300 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-200 focus:outline-none transition-all shadow-sm"
                >
                  <option value="ingrediente"><Leaf /> Ingrediente</option>
                  <option value="bebida"><Coffee /> Bebida</option>
                  <option value="utensilio"><Utensils /> Utensilio</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-5 py-3 border-2 border-slate-300 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-200 focus:outline-none transition-all shadow-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    Unidad
                  </label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-5 py-3 border-2 border-slate-300 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-200 focus:outline-none transition-all shadow-sm"
                    placeholder="kg, L, pzas"
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  value={newItem.minStock}
                  onChange={(e) =>
                    setNewItem({ ...newItem, minStock: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-5 py-3 border-2 border-slate-300 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-200 focus:outline-none transition-all shadow-sm"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gradient-to-r from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 text-slate-700 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <X className="w-6 h-6" />
                Cancelar
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-6 h-6" />
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
