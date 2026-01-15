import { createContext, useContext, useState, type ReactNode } from 'react';

export interface IngredientRequirement {
  inventoryId: number;
  quantity: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'entrada' | 'plato-fuerte' | 'postre' | 'bebida';
  image?: string;
  ingredients?: IngredientRequirement[];
}

export interface OrderItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface Order {
  tableId: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'paid';
  total: number;
  timestamp: Date;
  paymentMethod?: 'efectivo' | 'tarjeta' | 'sinpe';
  areaName?: string;
  paidAt?: Date;
}

export interface Table {
  id: number;
  capacity: number;
}

export interface Area {
  id: string;
  name: string;
  icon: string;
  tables: Table[];
  image: string;
}

interface RestaurantContextType {
  areas: Area[];
  tables: number[];
  orders: Order[];
  currentTable: number | null;
  currentOrder: OrderItem[];
  setCurrentTable: (tableId: number | null) => void;
  addItemToOrder: (item: MenuItem) => void;
  removeItemFromOrder: (itemId: number) => void;
  updateItemQuantity: (itemId: number, quantity: number, notes?: string) => void;
  confirmOrder: () => void;
  markOrderReady: (tableId: number) => void;
  completePayment: (method: 'efectivo' | 'tarjeta' | 'sinpe') => void;
  getTodayPayments: () => Order[];
  clearCurrentOrder: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const menuItems: MenuItem[] = [
  // Entradas
  { 
    id: 1, 
    name: 'Ensalada César', 
    description: 'Lechuga romana, crutones y aderezo', 
    price: 85, 
    category: 'entrada',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
    ingredients: [
      { inventoryId: 1, quantity: 0.15 }, // Lechuga
      { inventoryId: 2, quantity: 0.05 }, // Tomate
      { inventoryId: 8, quantity: 0.03 }, // Queso
    ]
  },
  { 
    id: 2, 
    name: 'Sopa de Champiñones', 
    description: 'Cremosa sopa con champiñones frescos', 
    price: 75, 
    category: 'entrada',
    image: 'https://images.unsplash.com/photo-1624968814155-236efede1cec?w=400',
    ingredients: [
      { inventoryId: 14, quantity: 0.2 }, // Champiñones
      { inventoryId: 15, quantity: 0.05 }, // Cebolla
      { inventoryId: 23, quantity: 0.1 }, // Leche
    ]
  },
  { 
    id: 3, 
    name: 'Bruschetta', 
    description: 'Pan tostado con tomate y albahaca', 
    price: 65, 
    category: 'entrada',
    image: 'https://images.unsplash.com/photo-1626634896715-88334e9da24f?w=400',
    ingredients: [
      { inventoryId: 2, quantity: 0.1 }, // Tomate
      { inventoryId: 10, quantity: 0.01 }, // Aceite de oliva
    ]
  },
  
  // Platos Fuertes
  { 
    id: 4, 
    name: 'Filete a la Parrilla', 
    description: 'Filete de res con vegetales', 
    price: 280, 
    category: 'plato-fuerte',
    image: 'https://images.unsplash.com/photo-1708615017161-2eff302d0389?w=400',
    ingredients: [
      { inventoryId: 3, quantity: 0.3 }, // Carne de res
      { inventoryId: 2, quantity: 0.08 }, // Tomate
      { inventoryId: 15, quantity: 0.05 }, // Cebolla
    ]
  },
  { 
    id: 5, 
    name: 'Pasta Alfredo', 
    description: 'Fettuccine en salsa cremosa', 
    price: 180, 
    category: 'plato-fuerte',
    image: 'https://images.unsplash.com/photo-1662197480393-2a82030b7b83?w=400',
    ingredients: [
      { inventoryId: 6, quantity: 0.15 }, // Pasta
      { inventoryId: 8, quantity: 0.05 }, // Queso
      { inventoryId: 23, quantity: 0.1 }, // Leche
    ]
  },
  { 
    id: 6, 
    name: 'Salmón al Horno', 
    description: 'Salmón con arroz y limón', 
    price: 260, 
    category: 'plato-fuerte',
    image: 'https://images.unsplash.com/photo-1556845752-92f6fe9f596d?w=400',
    ingredients: [
      { inventoryId: 5, quantity: 0.25 }, // Salmón
      { inventoryId: 7, quantity: 0.1 }, // Arroz
      { inventoryId: 13, quantity: 1 }, // Limones
    ]
  },
  { 
    id: 7, 
    name: 'Pizza Margherita', 
    description: 'Tomate, mozzarella y albahaca', 
    price: 160, 
    category: 'plato-fuerte',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    ingredients: [
      { inventoryId: 2, quantity: 0.15 }, // Tomate
      { inventoryId: 8, quantity: 0.2 }, // Queso
      { inventoryId: 10, quantity: 0.02 }, // Aceite de oliva
    ]
  },
  
  // Postres
  { 
    id: 8, 
    name: 'Tiramisú', 
    description: 'Postre italiano clásico', 
    price: 95, 
    category: 'postre',
    image: 'https://images.unsplash.com/photo-1714385905983-6f8e06fffae1?w=400',
    ingredients: [
      { inventoryId: 8, quantity: 0.08 }, // Queso
      { inventoryId: 9, quantity: 2 }, // Huevos
      { inventoryId: 21, quantity: 0.02 }, // Café
    ]
  },
  { 
    id: 9, 
    name: 'Cheesecake', 
    description: 'Pastel de queso con frutos rojos', 
    price: 85, 
    category: 'postre',
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400',
    ingredients: [
      { inventoryId: 8, quantity: 0.15 }, // Queso
      { inventoryId: 9, quantity: 3 }, // Huevos
    ]
  },
  { 
    id: 10, 
    name: 'Helado', 
    description: 'Tres bolas a elegir', 
    price: 60, 
    category: 'postre',
    image: 'https://images.unsplash.com/photo-1673551494246-0ea345ddbf86?w=400',
    ingredients: [
      { inventoryId: 23, quantity: 0.15 }, // Leche
    ]
  },
  
  // Bebidas
  { 
    id: 11, 
    name: 'Limonada Natural', 
    description: 'Limonada fresca del día', 
    price: 45, 
    category: 'bebida',
    image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe1790?w=400',
    ingredients: [
      { inventoryId: 13, quantity: 3 }, // Limones
    ]
  },
  { 
    id: 12, 
    name: 'Refresco', 
    description: 'Coca-Cola, Sprite, Fanta', 
    price: 35, 
    category: 'bebida',
    image: 'https://images.unsplash.com/photo-1676300182703-33124fbacbcf?w=400',
    ingredients: [
      { inventoryId: 16, quantity: 1 }, // Coca-Cola (se podría usar IDs 16, 17, 18)
    ]
  },
  { 
    id: 13, 
    name: 'Agua Mineral', 
    description: 'Agua embotellada', 
    price: 25, 
    category: 'bebida',
    image: 'https://images.unsplash.com/photo-1598019559137-40d9afebc687?w=400',
    ingredients: [
      { inventoryId: 19, quantity: 1 }, // Agua Mineral
    ]
  },
  { 
    id: 14, 
    name: 'Café Americano', 
    description: 'Café recién hecho', 
    price: 40, 
    category: 'bebida',
    image: 'https://images.unsplash.com/photo-1533776992670-a72f4c28235e?w=400',
    ingredients: [
      { inventoryId: 21, quantity: 0.015 }, // Café en grano
    ]
  },
];

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [areas] = useState<Area[]>([
    { 
      id: 'salon1', 
      name: 'Salón 1', 
      icon: '🏛️', 
      tables: [
        { id: 1, capacity: 4 },
        { id: 2, capacity: 4 },
        { id: 3, capacity: 6 },
        { id: 4, capacity: 2 },
        { id: 5, capacity: 8 },
        { id: 6, capacity: 4 },
      ],
      image: 'https://images.unsplash.com/photo-1743793055775-3c07ab847ad0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcmVzdGF1cmFudCUyMGRpbmluZyUyMHJvb218ZW58MXx8fHwxNzY4NDYwNzE0fDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    { 
      id: 'salon2', 
      name: 'Salón 2', 
      icon: '🏢', 
      tables: [
        { id: 7, capacity: 4 },
        { id: 8, capacity: 4 },
        { id: 9, capacity: 6 },
        { id: 10, capacity: 2 },
        { id: 11, capacity: 8 },
        { id: 12, capacity: 4 },
      ],
      image: 'https://images.unsplash.com/photo-1762087577613-978bf9066d39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3IlMjB0YWJsZXN8ZW58MXx8fHwxNzY4NDYwNzE1fDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    { 
      id: 'vip', 
      name: 'VIP', 
      icon: '👑', 
      tables: [
        { id: 13, capacity: 6 },
        { id: 14, capacity: 8 },
        { id: 15, capacity: 10 },
        { id: 16, capacity: 6 },
      ],
      image: 'https://images.unsplash.com/photo-1753727471014-efe38840c7c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXAlMjByZXN0YXVyYW50JTIwZGluaW5nJTIwbHV4dXJ5fGVufDF8fHx8MTc2ODQ2MjIyMnww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    { 
      id: 'cemento', 
      name: 'Cemento', 
      icon: '🪨', 
      tables: [
        { id: 17, capacity: 4 },
        { id: 18, capacity: 6 },
        { id: 19, capacity: 4 },
        { id: 20, capacity: 8 },
      ],
      image: 'https://images.unsplash.com/photo-1697378006953-40c5bb9e6ca5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwdGVycmFjZSUyMG91dGRvb3J8ZW58MXx8fHwxNzY4Mzk3ODg5fDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    { 
      id: 'barras', 
      name: 'Barras', 
      icon: '🍺', 
      tables: [
        { id: 21, capacity: 2 },
        { id: 22, capacity: 2 },
        { id: 23, capacity: 2 },
        { id: 24, capacity: 4 },
        { id: 25, capacity: 4 },
        { id: 26, capacity: 6 },
      ],
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwYmFyfGVufDF8fHx8MTc2ODQ2MjIyMnww&ixlib=rb-4.1.0&q=80&w=1080'
    },
  ]);
  const allTables = areas.flatMap(area => area.tables.map(t => t.id));
  const [tables] = useState<number[]>(allTables);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTable, setCurrentTable] = useState<number | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);

  const addItemToOrder = (item: MenuItem) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItemFromOrder = (itemId: number) => {
    setCurrentOrder((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateItemQuantity = (itemId: number, quantity: number, notes?: string) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }
    
    setCurrentOrder((prev) => {
      const existingItem = prev.find((i) => i.id === itemId);
      
      if (existingItem) {
        // Actualizar item existente
        return prev.map((i) => (i.id === itemId ? { ...i, quantity, notes: notes || i.notes } : i));
      } else {
        // Agregar nuevo item
        const menuItem = menuItems.find(m => m.id === itemId);
        if (menuItem) {
          return [...prev, { ...menuItem, quantity, notes }];
        }
        return prev;
      }
    });
  };

  const confirmOrder = () => {
    if (currentTable === null || currentOrder.length === 0) return;

    const total = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder: Order = {
      tableId: currentTable,
      items: currentOrder,
      status: 'preparing',
      total,
      timestamp: new Date(),
    };

    setOrders((prev) => [...prev, newOrder]);
    setCurrentOrder([]);
  };

  const markOrderReady = (tableId: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.tableId === tableId && order.status === 'preparing'
          ? { ...order, status: 'ready' }
          : order
      )
    );
  };

  const completePayment = (method: 'efectivo' | 'tarjeta' | 'sinpe') => {
    if (currentTable === null) return;

    // Encontrar el área de la mesa actual
    const area = areas.find(a => a.tables.some(t => t.id === currentTable));

    setOrders((prev) =>
      prev.map((order) =>
        order.tableId === currentTable && order.status !== 'paid'
          ? { 
              ...order, 
              status: 'paid',
              paymentMethod: method,
              areaName: area?.name,
              paidAt: new Date()
            }
          : order
      )
    );
    setCurrentTable(null);
  };

  const getTodayPayments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(order => {
      if (!order.paidAt) return false;
      const paidDate = new Date(order.paidAt);
      paidDate.setHours(0, 0, 0, 0);
      return paidDate.getTime() === today.getTime() && order.status === 'paid';
    });
  };

  const clearCurrentOrder = () => {
    setCurrentOrder([]);
  };

  return (
    <RestaurantContext.Provider
      value={{
        areas,
        tables,
        orders,
        currentTable,
        currentOrder,
        setCurrentTable,
        addItemToOrder,
        removeItemFromOrder,
        updateItemQuantity,
        confirmOrder,
        markOrderReady,
        completePayment,
        clearCurrentOrder,
        getTodayPayments,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return context;
}
