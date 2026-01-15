import { createContext, useContext, useState, type ReactNode } from 'react';

export interface InventoryItem {
  id: number;
  name: string;
  category: 'ingrediente' | 'bebida' | 'utensilio';
  quantity: number;
  unit: string;
  minStock: number;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryQuantity: (id: number, quantity: number) => void;
  removeInventoryItem: (id: number) => void;
  getLowStockItems: () => InventoryItem[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const initialInventory: InventoryItem[] = [
  // Ingredientes
  { id: 1, name: 'Lechuga', category: 'ingrediente', quantity: 15, unit: 'kg', minStock: 5 },
  { id: 2, name: 'Tomate', category: 'ingrediente', quantity: 20, unit: 'kg', minStock: 8 },
  { id: 3, name: 'Carne de Res', category: 'ingrediente', quantity: 25, unit: 'kg', minStock: 10 },
  { id: 4, name: 'Pollo', category: 'ingrediente', quantity: 18, unit: 'kg', minStock: 10 },
  { id: 5, name: 'Salmón', category: 'ingrediente', quantity: 8, unit: 'kg', minStock: 5 },
  { id: 6, name: 'Pasta', category: 'ingrediente', quantity: 12, unit: 'kg', minStock: 5 },
  { id: 7, name: 'Arroz', category: 'ingrediente', quantity: 30, unit: 'kg', minStock: 10 },
  { id: 8, name: 'Queso', category: 'ingrediente', quantity: 10, unit: 'kg', minStock: 5 },
  { id: 9, name: 'Huevos', category: 'ingrediente', quantity: 200, unit: 'pzas', minStock: 100 },
  { id: 10, name: 'Aceite de Oliva', category: 'ingrediente', quantity: 8, unit: 'L', minStock: 3 },
  { id: 11, name: 'Sal', category: 'ingrediente', quantity: 5, unit: 'kg', minStock: 2 },
  { id: 12, name: 'Pimienta', category: 'ingrediente', quantity: 3, unit: 'kg', minStock: 1 },
  { id: 13, name: 'Limones', category: 'ingrediente', quantity: 50, unit: 'pzas', minStock: 20 },
  { id: 14, name: 'Champiñones', category: 'ingrediente', quantity: 6, unit: 'kg', minStock: 3 },
  { id: 15, name: 'Cebolla', category: 'ingrediente', quantity: 12, unit: 'kg', minStock: 5 },
  
  // Bebidas
  { id: 16, name: 'Coca-Cola', category: 'bebida', quantity: 48, unit: 'botellas', minStock: 24 },
  { id: 17, name: 'Sprite', category: 'bebida', quantity: 36, unit: 'botellas', minStock: 24 },
  { id: 18, name: 'Fanta', category: 'bebida', quantity: 24, unit: 'botellas', minStock: 24 },
  { id: 19, name: 'Agua Mineral', category: 'bebida', quantity: 72, unit: 'botellas', minStock: 48 },
  { id: 20, name: 'Jugo de Naranja', category: 'bebida', quantity: 15, unit: 'L', minStock: 10 },
  { id: 21, name: 'Café en Grano', category: 'bebida', quantity: 8, unit: 'kg', minStock: 3 },
  { id: 22, name: 'Té', category: 'bebida', quantity: 100, unit: 'sobres', minStock: 50 },
  { id: 23, name: 'Leche', category: 'bebida', quantity: 20, unit: 'L', minStock: 10 },
  
  // Utensilios
  { id: 24, name: 'Platos', category: 'utensilio', quantity: 150, unit: 'pzas', minStock: 100 },
  { id: 25, name: 'Vasos', category: 'utensilio', quantity: 200, unit: 'pzas', minStock: 150 },
  { id: 26, name: 'Cubiertos', category: 'utensilio', quantity: 180, unit: 'sets', minStock: 120 },
  { id: 27, name: 'Servilletas', category: 'utensilio', quantity: 500, unit: 'pzas', minStock: 200 },
];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [nextId, setNextId] = useState(28);

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    setInventory((prev) => [...prev, { ...item, id: nextId }]);
    setNextId(nextId + 1);
  };

  const updateInventoryQuantity = (id: number, quantity: number) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeInventoryItem = (id: number) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const getLowStockItems = () => {
    return inventory.filter((item) => item.quantity <= item.minStock);
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        addInventoryItem,
        updateInventoryQuantity,
        removeInventoryItem,
        getLowStockItems,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
}
