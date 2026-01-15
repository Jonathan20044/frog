import { createContext, useContext, useState, type ReactNode } from 'react';

export interface RefillRecord {
  id: number;
  storageRoom: string;
  itemsRefilled: { itemId: number; itemName: string; quantity: number; unit: string }[];
  waiter: string;
  date: Date;
}

interface StorageContextType {
  refillRecords: RefillRecord[];
  addRefillRecord: (record: Omit<RefillRecord, 'id' | 'date'>) => void;
  getTodayRefills: () => RefillRecord[];
  clearRefillRecords: () => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [refillRecords, setRefillRecords] = useState<RefillRecord[]>([]);

  const addRefillRecord = (record: Omit<RefillRecord, 'id' | 'date'>) => {
    const newRecord: RefillRecord = {
      ...record,
      id: Date.now(),
      date: new Date()
    };
    setRefillRecords(prev => [...prev, newRecord]);
  };

  const getTodayRefills = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return refillRecords.filter(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });
  };

  const clearRefillRecords = () => {
    setRefillRecords([]);
  };

  return (
    <StorageContext.Provider
      value={{
        refillRecords,
        addRefillRecord,
        getTodayRefills,
        clearRefillRecords
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
}
