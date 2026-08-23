/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'system';
    });
    
    // Default to 'red' accent, support 'green'
    const [accentColor, setAccentColor] = useState(() => {
        return localStorage.getItem('accentColor') || 'red';
    });

    const [isLowPerf, setIsLowPerf] = useState(() => {
        return localStorage.getItem('isLowPerf') === 'true';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = (currentTheme) => {
            let activeTheme = currentTheme;
            if (currentTheme === 'system') {
                activeTheme = mediaQuery.matches ? 'dark' : 'light';
            }

            root.classList.remove('light', 'dark');
            root.classList.add(activeTheme);

            // Update data-theme for CSS variables if needed
            root.setAttribute('data-theme', activeTheme);
        };

        applyTheme(theme);
        localStorage.setItem('theme', theme);

        // Apply Accent Color
        root.setAttribute('data-accent', accentColor);
        localStorage.setItem('accentColor', accentColor);

        // Apply Performance Mode attribute
        root.setAttribute('data-low-perf', isLowPerf);
        localStorage.setItem('isLowPerf', isLowPerf);

        const listener = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
    }, [theme, accentColor, isLowPerf]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, isLowPerf, setIsLowPerf }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
