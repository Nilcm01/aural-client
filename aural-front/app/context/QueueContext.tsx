import React, { createContext, useContext, useState } from 'react';

export interface QueueItem {
  id: string;
  image: string;
  name: string;
  uri: string;
}

interface QueueContextProps {
  queue: QueueItem[];
  addToQueue: (item: QueueItem) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  updateQueue: (newQueue: QueueItem[]) => void; // Función nueva para actualizar la cola
}

const QueueContext = createContext<QueueContextProps | undefined>(undefined);

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueue must be used within a QueueProvider");
  }
  return context;
};

interface QueueProviderProps {
  children: React.ReactNode;
}

export const QueueProvider: React.FC<QueueProviderProps> = ({ children }) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const addToQueue = (item: QueueItem) => {
    setQueue(prev => [...prev, item]);
  };

  // Remueve solo la primera ocurrencia con el id indicado
  const removeFromQueue = (id: string) => {
    setQueue(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index === -1) return prev;
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  };

  const clearQueue = () => {
    setQueue([]);
  };

  // Función para actualizar la cola con una nueva lista (por ejemplo, de la API)
  const updateQueue = (newQueue: QueueItem[]) => {
    setQueue(newQueue);
  };

  return (
    <QueueContext.Provider value={{ queue, addToQueue, removeFromQueue, clearQueue, updateQueue }}>
      {children}
    </QueueContext.Provider>
  );
};
