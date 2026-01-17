import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UtensilsCrossed, Salad, Beef, Cake, Wine, Edit3, Plus, MessageSquare, Lightbulb, CheckCircle, Trash2 } from 'lucide-react';
import { useRestaurant, menuItems, type MenuItem } from '../context/RestaurantContext';
import { useInventory } from '../context/InventoryContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import InteractiveGuide, { GuideButton, type GuideStep } from '../components/InteractiveGuide';
import toast, { Toaster } from 'react-hot-toast';

const guideSteps: GuideStep[] = [
  {
    title: '¡Bienvenido al Menú!',
    description: 'Aquí puedes tomar órdenes para la mesa seleccionada. Te mostraré cómo funciona.',
    position: 'center',
  },
  {
    title: 'Categorías del Menú',
    description: 'Filtra los platillos por categoría: Entradas, Platos Fuertes, Postres o Bebidas.',
    target: 'category-tabs',
    position: 'bottom',
  },
  {
    title: 'Seleccionar Platillos',
    description: 'Haz clic en "Agregar" para añadir un platillo a la orden. Si el platillo tiene opciones, podrás personalizarlo.',
    target: 'menu-items',
    position: 'right',
  },
  {
    title: 'Carrito de Orden',
    description: 'Aquí verás todos los platillos agregados. Puedes ajustar cantidades, agregar notas especiales o eliminar items.',
    target: 'order-cart',
    position: 'left',
  },
  {
    title: 'Confirmar Orden',
    description: 'Cuando termines, haz clic en "Confirmar Orden" para enviarla a cocina y actualizar el inventario.',
    target: 'confirm-button',
    position: 'top',
  },
];

export default function MenuPage() {
  const navigate = useNavigate();
  const {
    currentTable,
    currentOrder,
    updateItemQuantity,
    removeItemFromOrder,
    confirmOrder,
  } = useRestaurant();
  
  const { updateInventoryQuantity, inventory } = useInventory();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showGuide, setShowGuide] = useState(false);

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
      toast.error('Agrega al menos un platillo a la orden', {
        duration: 3000,
        icon: '🍽️',
      });
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
      toast.error(
        <div>
          <p className="font-bold mb-2">No hay suficientes ingredientes:</p>
          <ul className="text-sm space-y-1">
            {insufficientIngredients.map((ing, i) => (
              <li key={i}>• {ing}</li>
            ))}
          </ul>
          <p className="text-sm mt-2 italic">Por favor ajusta la orden o actualiza el inventario.</p>
        </div>,
        {
          duration: 6000,
          icon: '⚠️',
        }
      );
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
    toast.success('¡Orden confirmada! Los cocineros están preparando tu pedido', {
      duration: 4000,
      icon: '✅',
    });
    setTimeout(() => navigate('/'), 500);
  };


  const handleAddItem = (item: MenuItem) => {
    if (item.customizations && item.customizations.length > 0) {
      // Si tiene opciones de personalización, abrir modal
      setCustomizingItem(item);
      setCustomNotes('');
      setSelectedOptions({});
      setEditingItemId(null);
      setShowCustomModal(true);
    } else {
      // Si no tiene opciones, agregar directamente
      const inOrder = currentOrder.find((i) => i.id === item.id);
      updateItemQuantity(item.id, (inOrder?.quantity || 0) + 1);
    }
  };

  const handleEditItem = (item: MenuItem & { quantity: number; notes?: string; selectedOptions?: Record<string, string> }) => {
    setCustomizingItem(item);
    setCustomNotes(item.notes || '');
    setSelectedOptions(item.selectedOptions || {});
    setEditingItemId(item.id);
    setShowCustomModal(true);
  };

  const handleConfirmCustomItem = () => {
    if (customizingItem) {
      // Verificar que todas las opciones requeridas estén seleccionadas
      const missingRequired = customizingItem.customizations?.filter(
        opt => opt.required && !selectedOptions[opt.id]
      );
      
      if (missingRequired && missingRequired.length > 0) {
        toast.error(`Por favor selecciona: ${missingRequired.map(o => o.name).join(', ')}`, {
          duration: 4000,
          icon: '📝',
        });
        return;
      }
      
      const inOrder = currentOrder.find((i) => i.id === customizingItem.id);
      
      if (editingItemId) {
        // Editando un item existente
        updateItemQuantity(customizingItem.id, inOrder?.quantity || 1, customNotes, selectedOptions);
      } else {
        // Agregando nuevo item
        updateItemQuantity(customizingItem.id, (inOrder?.quantity || 0) + 1, customNotes, selectedOptions);
      }
      
      setShowCustomModal(false);
      setCustomizingItem(null);
      setCustomNotes('');
      setSelectedOptions({});
      setEditingItemId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'font-semibold',
          style: {
            padding: '16px',
            borderRadius: '12px',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 shadow-2xl border-b-4 border-cyan-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl blur opacity-50"></div>
              <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                <UtensilsCrossed className="w-8 h-8 text-cyan-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-white font-bold text-3xl tracking-tight drop-shadow-lg">
                Mesa {currentTable}
              </h1>
              <p className="text-cyan-100 text-base font-semibold mt-1">Selecciona tus platillos favoritos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Tabs */}
            <div id="category-tabs" className="bg-gradient-to-r from-white to-slate-50 rounded-2xl shadow-xl p-4 mb-8 flex gap-3 flex-wrap border-2 border-slate-200">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-xl transition-all font-bold transform ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 text-white shadow-xl scale-110'
                        : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-slate-200 hover:border-cyan-300'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Menu Items Grid */}
            <div id="menu-items" className="grid sm:grid-cols-2 gap-6">
              {filteredMenu.map((item) => {
                const inOrder = currentOrder.find((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all group transform hover:scale-105 border-2 border-slate-200 hover:border-cyan-300"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                      <ImageWithFallback
                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-xl text-lg font-bold shadow-2xl">
                        ₡{item.price}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-5">{item.description}</p>
                      
                      <button
                        onClick={() => handleAddItem(item)}
                        className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white py-3 rounded-xl transition-all font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-6 h-6" />
                        {inOrder ? `Agregar más (${inOrder.quantity})` : 'Agregar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div id="order-cart" className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl p-8 sticky top-6 border-2 border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-cyan-600 to-blue-600 p-3 rounded-xl shadow-lg">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Orden Actual</h2>
              </div>
              
              {currentOrder.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-cyan-600 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <UtensilsCrossed className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-slate-400 font-semibold text-lg flex items-center justify-center gap-2">
                    <UtensilsCrossed className="w-6 h-6" />
                    No hay ítems en la orden
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                    {currentOrder.map((item) => {
                      const menuItem = menuItems.find(m => m.id === item.id);
                      return (
                        <div key={item.id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-slate-200 hover:border-cyan-300">
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300 shadow-lg">
                            <ImageWithFallback
                              src={menuItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold mb-2 text-slate-800">{item.name}</h4>
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <div className="mb-2 flex flex-wrap gap-1.5">
                                {Object.entries(item.selectedOptions).map(([key, value]) => (
                                  <span key={key} className="text-xs font-semibold bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 px-3 py-1 rounded-full border border-cyan-300">
                                    {value}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.notes && (
                              <p className="text-xs text-amber-700 mb-2 italic bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                "{item.notes}"
                              </p>
                            )}
                            <p className="text-base font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">₡{item.price} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95"
                              title="Personalizar"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1, item.notes)}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl text-lg font-bold transform hover:scale-110 active:scale-95"
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
                                className="bg-gradient-to-r from-red-500 to-pink-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl text-lg font-bold transform hover:scale-110 active:scale-95"
                              >
                                −
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t-2 border-slate-200 pt-6 space-y-4">
                    <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-teal-50 p-5 rounded-xl border-2 border-cyan-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-slate-700">Total:</span>
                        <span className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">₡{totalOrder}</span>
                      </div>
                    </div>
                    <button
                      id="confirm-button"
                      onClick={handleConfirmOrder}
                      className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white py-5 rounded-xl transition-all font-bold text-xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-6 h-6" />
                      Confirmar Orden
                    </button>
                    <button
                      onClick={() => {
                        if (currentOrder.length > 0) {
                          toast(
                            (t) => (
                              <div className="flex flex-col gap-3">
                                <p className="font-bold">¿Cancelar esta orden?</p>
                                <p className="text-sm">Se perderán todos los platillos seleccionados</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      toast.dismiss(t.id);
                                      navigate('/');
                                    }}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
                                  >
                                    Sí, cancelar
                                  </button>
                                  <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ),
                            {
                              duration: 10000,
                              icon: '⚠️',
                            }
                          );
                        } else {
                          navigate('/');
                        }
                      }}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-xl transition-all font-bold text-lg shadow-lg hover:shadow-red-500/50 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Cancelar Orden
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
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border-2 border-slate-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">{customizingItem.name}</h3>
                <p className="text-base text-slate-600 mt-2">{customizingItem.description}</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mt-3">₡{customizingItem.price}</p>
                {editingItemId && (
                  <span className="inline-block mt-3 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-bold rounded-xl border-2 border-blue-300 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Editando personalización
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setEditingItemId(null);
                  setSelectedOptions({});
                }}
                className="text-slate-400 hover:text-slate-600 transition-all bg-slate-100 hover:bg-slate-200 p-3 rounded-xl transform hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Opciones de personalización */}
            {customizingItem.customizations && customizingItem.customizations.length > 0 && (
              <div className="mb-8 space-y-6">
                {customizingItem.customizations.map((customization) => (
                  <div key={customization.id} className="bg-gradient-to-r from-slate-50 to-slate-100 p-5 rounded-2xl border-2 border-slate-200">
                    <label className="block text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="bg-gradient-to-r from-cyan-600 to-blue-600 w-1.5 h-6 rounded-full"></span>
                      {customization.name}
                      {customization.required && <span className="text-red-500 text-xl ml-1">*</span>}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {customization.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [customization.id]: option }))}
                          className={`px-5 py-4 rounded-xl font-bold transition-all border-2 transform ${
                            selectedOptions[customization.id] === option
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-600 shadow-xl scale-105'
                              : 'bg-white text-gray-700 border-slate-300 hover:border-cyan-400 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 shadow-md hover:shadow-lg hover:scale-105'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-8">
              <label className="block text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Notas adicionales (opcional)
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Ej: Sin cebolla, extra queso, sin picante..."
                className="w-full px-5 py-4 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-600 resize-none transition-all shadow-sm text-base"
                rows={4}
              />
              <p className="text-sm text-slate-500 mt-3 bg-slate-100 px-4 py-2 rounded-lg flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Indica si deseas quitar o agregar ingredientes
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setEditingItemId(null);
                  setSelectedOptions({});
                }}
                className="flex-1 bg-gradient-to-r from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 text-slate-700 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <X className="w-6 h-6" />
                Cancelar
              </button>
              <button
                onClick={handleConfirmCustomItem}
                className="flex-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                {editingItemId ? <><Edit3 className="w-6 h-6" /> Actualizar</> : <><Plus className="w-6 h-6" /> Agregar a la orden</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón de ayuda y guía interactiva */}
      <GuideButton onClick={() => setShowGuide(true)} />
      {showGuide && (
        <InteractiveGuide
          steps={guideSteps}
          onComplete={() => setShowGuide(false)}
          pageName="Menú de Órdenes"
        />
      )}
    </div>
  );
}
