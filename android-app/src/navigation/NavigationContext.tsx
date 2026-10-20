import React, { createContext, useContext, useState, useEffect } from 'react';
import { BackHandler } from 'react-native';

export type MainTab = 'home' | 'clean' | 'storage' | 'settings';
export type ActiveScreen = MainTab | 'queue' | 'update' | 'privacy';

interface NavigationContextType {
  currentScreen: ActiveScreen;
  activeTab: MainTab;
  navigateTo: (screen: ActiveScreen) => void;
  navigateTab: (tab: MainTab) => void;
  goBack: () => boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('home');
  const [history, setHistory] = useState<ActiveScreen[]>(['home']);
  const [activeTab, setActiveTab] = useState<MainTab>('home');

  const navigateTo = (screen: ActiveScreen) => {
    if (screen === currentScreen) return;
    setHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
    if (screen === 'home' || screen === 'clean' || screen === 'storage' || screen === 'settings') {
      setActiveTab(screen);
    }
  };

  const navigateTab = (tab: MainTab) => {
    navigateTo(tab);
  };

  const goBack = (): boolean => {
    if (history.length > 1) {
      const nextHistory = [...history];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setHistory(nextHistory);
      setCurrentScreen(prevScreen);
      if (prevScreen === 'home' || prevScreen === 'clean' || prevScreen === 'storage' || prevScreen === 'settings') {
        setActiveTab(prevScreen);
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      return goBack();
    });
    return () => subscription.remove();
  }, [history]);

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        activeTab,
        navigateTo,
        navigateTab,
        goBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useAppNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useAppNavigation must be used within NavigationProvider');
  }
  return context;
};
