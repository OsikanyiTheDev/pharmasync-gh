'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SyncQueueItem } from '../lib/types';
import { StorageEngine } from '../lib/db';

interface OfflineContextType {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  toggleOfflineSimulation: () => void;
  syncQueue: SyncQueueItem[];
  pendingSyncCount: number;
  isSyncing: boolean;
  triggerManualSync: () => Promise<void>;
  addToSyncQueue: (action: SyncQueueItem['action'], payload: any) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    // Initial sync queue load
    setSyncQueue(StorageEngine.getSyncQueue());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleOfflineSimulation = () => {
    setIsOnline(prev => !prev);
  };

  const addToSyncQueue = (action: SyncQueueItem['action'], payload: any) => {
    const newItem = StorageEngine.addToSyncQueue({ action, payload });
    setSyncQueue(prev => [...prev, newItem]);
  };

  const triggerManualSync = async () => {
    if (syncQueue.length === 0) return;
    setIsSyncing(true);

    // Simulate network sync latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    StorageEngine.clearSyncQueue();
    setSyncQueue([]);
    setIsSyncing(false);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        setIsOnline,
        toggleOfflineSimulation,
        syncQueue,
        pendingSyncCount: syncQueue.length,
        isSyncing,
        triggerManualSync,
        addToSyncQueue,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
