import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, AlertTriangle, Package, Minus, Trash2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function InventoryPage() {
  const navigate = useNavigate();
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
    { id: 'ingrediente', name: 'Ingredientes', icon: '🥬' },
    { id: 'bebida', name: 'Bebidas', icon: '🥤' },
    { id: 'utensilio', name: 'Utensilios', icon: '🍴' },
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
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                <Package className="w-8 h-8" />
                Inventario - FROG
              </h1>
              <p className="text-emerald-100">Gestión de Ingredientes y Bebidas</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-semibold transition shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alertas de Stock Bajo */}
        {lowStockItems.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-5 mb-8 rounded-xl shadow-md">
            <div className="flex items-center mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 mr-3" />
              <h3 className="text-lg font-bold text-amber-800">
                {lowStockItems.length} producto{lowStockItems.length !== 1 ? 's' : ''} con stock bajo
              </h3>
            </div>
            <div className="ml-9 flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <span
                  key={item.id}
                  className="bg-amber-200 text-amber-900 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm"
                >
                  {item.name} ({item.quantity} {item.unit})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => {
              const Icon = typeof cat.icon === 'string' ? null : cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-emerald-50 shadow-sm'
                  }`}
                >
                  {Icon ? <Icon className="w-4 h-4" /> : <span>{cat.icon as string}</span>}
                  {cat.name}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Agregar Item
          </button>
        </div>

        {/* Tabla de Inventario */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-white">Producto</th>
                  <th className="px-6 py-4 text-left font-bold text-white">Categoría</th>
                  <th className="px-6 py-4 text-center font-bold text-white">Cantidad</th>
                  <th className="px-6 py-4 text-center font-bold text-white">Stock Mínimo</th>
                  <th className="px-6 py-4 text-center font-bold text-white">Estado</th>
                  <th className="px-6 py-4 text-center font-bold text-white">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => {
                  const status = getStockStatus(item);
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-100 hover:bg-emerald-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{item.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                          {item.category === 'ingrediente' && '🥬 Ingrediente'}
                          {item.category === 'bebida' && '🥤 Bebida'}
                          {item.category === 'utensilio' && '🍴 Utensilio'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            className="bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-lg font-bold transition shadow-sm flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-lg min-w-[90px] text-slate-800">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-9 h-9 rounded-lg font-bold transition shadow-sm flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-slate-700">
                          {item.minStock} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-4 py-1.5 rounded-lg text-sm font-bold ${status.color} ${status.text} border-2`}
                        >
                          {status.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar "${item.name}" del inventario?`)) {
                              removeInventoryItem(item.id);
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow-sm flex items-center justify-center gap-2 mx-auto"
                        >
                          <Trash2 className="w-4 h-4" />
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
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No hay items en esta categoría</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Agregar Item */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Agregar Nuevo Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  placeholder="Ej: Tomates"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                >
                  <option value="ingrediente">🥬 Ingrediente</option>
                  <option value="bebida">🥤 Bebida</option>
                  <option value="utensilio">🍴 Utensilio</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unidad
                  </label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                    placeholder="kg, L, pzas"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  value={newItem.minStock}
                  onChange={(e) =>
                    setNewItem({ ...newItem, minStock: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-bold transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
