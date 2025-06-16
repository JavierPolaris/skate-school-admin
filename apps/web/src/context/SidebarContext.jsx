import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

useEffect(() => {
  const handleClickOutside = (event) => {
    // ✅ Solo ejecutar esto en móvil
    if (window.innerWidth > 768) return;

    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.querySelector('.hamburger-menu');

    if (
      isSidebarOpen &&
      sidebar && 
      !sidebar.contains(event.target) && 
      hamburger && 
      !hamburger.contains(event.target)
    ) {
      closeSidebar();
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isSidebarOpen]);


  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
