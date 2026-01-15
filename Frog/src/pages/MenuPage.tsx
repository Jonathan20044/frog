import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UtensilsCrossed, Salad, Beef, Cake, Wine, Edit3 } from 'lucide-react';
import { useRestaurant, menuItems, type MenuItem } from '../context/RestaurantContext';
import { useInventory } from '../context/InventoryContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

export default function MenuPage() {
  const navigate = useNavigate();
  const {
    currentTable,
    currentOrder,
    updateItemQuantity,
    removeItemFromOrder,
    confirmOrder,
    clearCurrentOrder,
  } = useRestaurant();
  
  const { updateInventoryQuantity, inventory } = useInventory();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  if (currentTable === null) {
    navigate('/');
    return null;
  }

  const categories = [
    { id: 'all', name: 'Todo', icon: UtensilsCrossed },
    { id: 'entrada', name: 'Entradas', icon: Salad },
    { id: 'plato-fuerte', name: 'Platos Fuertes', icon: Beef },
    { id: 'postre', name: 'Postres', icon: Cake },
    { id: 'bebida', name: 'Bebidas', icon: Wine },
  ];

  const filteredMenu =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const totalOrder = currentOrder.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleConfirmOrder = () => {
    if (currentOrder.length === 0) {
      alert('Agrega al menos un platillo a la orden');
      return;
    }
    
    // Verificar disponibilidad de ingredientes
    const insufficientIngredients: string[] = [];
    
    currentOrder.forEach((orderItem) => {
      const menuItem = menuItems.find(m => m.id === orderItem.id);
      if (menuItem?.ingredients) {
        menuItem.ingredients.forEach(ingredient => {
          const inventoryItem = inventory.find(inv => inv.id === ingredient.inventoryId);
          if (inventoryItem) {
            const totalRequired = ingredient.quantity * orderItem.quantity;
            if (inventoryItem.quantity < totalRequired) {
              insufficientIngredients.push(`${inventoryItem.name} (necesita ${totalRequired.toFixed(2)} ${inventoryItem.unit}, disponible: ${inventoryItem.quantity} ${inventoryItem.unit})`);
            }
          }
        });
      }
    });
    
    if (insufficientIngredients.length > 0) {
      alert(`No hay suficientes ingredientes:\\n\\n${insufficientIngredients.join('\\n')}\\n\\nPor favor ajusta la orden o actualiza el inventario.`);
      return;
    }
    
    // Reducir inventario
    currentOrder.forEach((orderItem) => {
      const menuItem = menuItems.find(m => m.id === orderItem.id);
      if (menuItem?.ingredients) {
        menuItem.ingredients.forEach(ingredient => {
          const inventoryItem = inventory.find(inv => inv.id === ingredient.inventoryId);
          if (inventoryItem) {
            const totalUsed = ingredient.quantity * orderItem.quantity;
            const newQuantity = Math.max(0, inventoryItem.quantity - totalUsed);
            updateInventoryQuantity(ingredient.inventoryId, newQuantity);
          }
        });
      }
    });
    
    confirmOrder();
    alert('¡Orden confirmada! Los cocineros están preparando tu pedido y el inventario ha sido actualizado.');
    navigate('/');
  };

  const handleCancel = () => {
    if (currentOrder.length > 0) {
      if (confirm('¿Estás seguro de cancelar la orden?')) {
        clearCurrentOrder();
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const handleAddItem = (item: MenuItem) => {
    const inOrder = currentOrder.find((i) => i.id === item.id);
    updateItemQuantity(item.id, (inOrder?.quantity || 0) + 1);
  };

  const handleEditItem = (item: MenuItem & { quantity: number; notes?: string }) => {
    setCustomizingItem(item);
    setCustomNotes(item.notes || '');
    setEditingItemId(item.id);
    setShowCustomModal(true);
  };

  const handleConfirmCustomItem = () => {
    if (customizingItem) {
      const inOrder = currentOrder.find((i) => i.id === customizingItem.id);
      
      if (editingItemId) {
        // Editando un item existente
        updateItemQuantity(customizingItem.id, inOrder?.quantity || 1, customNotes);
      } else {
        // Agregando nuevo item
        updateItemQuantity(customizingItem.id, (inOrder?.quantity || 0) + 1, customNotes);
      }
      
      setShowCustomModal(false);
      setCustomizingItem(null);
      setCustomNotes('');
      setEditingItemId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-green-600 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-2xl mb-1">Mesa {currentTable}</h1>
            <p className="text-green-100 text-sm">Selecciona los platillos</p>
          </div>
          <button
            onClick={handleCancel}
            className="bg-red-500 hover:bg-red-600 transition-colors px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex gap-2 flex-wrap">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === category.id
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* Menu Items Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredMenu.map((item) => {
                const inOrder = currentOrder.find((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <ImageWithFallback
                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm shadow-lg">
                        ${item.price}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg mb-1">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                      
                      <button
                        onClick={() => handleAddItem(item)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                      >
                        {inOrder ? `Agregar más (${inOrder.quantity})` : 'Agregar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl mb-4">Orden Actual</h2>
              
              {currentOrder.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay ítems en la orden</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {currentOrder.map((item) => {
                      const menuItem = menuItems.find(m => m.id === item.id);
                      return (
                        <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                            <ImageWithFallback
                              src={menuItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm mb-1">{item.name}</h4>
                            {item.notes && (
                              <p className="text-xs text-amber-600 mb-1 italic">"{item.notes}"</p>
                            )}
                            <p className="text-green-600 text-sm">${item.price} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="bg-blue-500 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                              title="Personalizar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1, item.notes)}
                                className="bg-green-600 text-white w-6 h-6 rounded flex items-center justify-center hover:bg-green-700 transition-colors text-sm"
                              >
                                +
                              </button>
                              <button
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateItemQuantity(item.id, item.quantity - 1, item.notes);
                                  } else {
                                    removeItemFromOrder(item.id);
                                  }
                                }}
                                className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                              >
                                −
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">${totalOrder}</span>
                    </div>
                    <button
                      onClick={handleConfirmOrder}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors"
                    >
                      Confirmar Orden
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de personalización */}
      {showCustomModal && customizingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{customizingItem.name}</h3>
                <p className="text-sm text-gray-600">{customizingItem.description}</p>
                {editingItemId && (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Editando personalización
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setEditingItemId(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personalización (opcional)
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Ej: Sin cebolla, extra queso, sin picante..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-2">
                Indica si deseas quitar o agregar ingredientes
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setEditingItemId(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmCustomItem}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                {editingItemId ? 'Actualizar' : 'Agregar al pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
