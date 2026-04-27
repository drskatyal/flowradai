import { useEffect, useState } from "react";

// Default value for sessionStorage
const DEFAULT_CURRENCY = false;

// Helper functions for sessionStorage management
const getStoredCurrency = (): boolean => {
    const stored = sessionStorage.getItem('isCurrency');
    return stored !== null ? stored === 'true' : DEFAULT_CURRENCY;
};

const setStoredCurrency = (value: boolean) => {
    sessionStorage.setItem('isCurrency', value.toString());
};

// Initialize default value in sessionStorage if not present
const initializeCurrencyStorage = () => {
    if (sessionStorage.getItem('isCurrency') === null) {
        setStoredCurrency(DEFAULT_CURRENCY);
    }
};

export const useCurrency = () => {

    // Initialize sessionStorage with default value on component mount
    useEffect(() => {
        initializeCurrencyStorage();
    }, []);

    // Initialize state from sessionStorage
    const [isCurrency, setIsCurrency] = useState(() => getStoredCurrency());

    const handleCurrencyChange = (val: boolean) => {
        setIsCurrency(val);
        setStoredCurrency(val); // Update sessionStorage immediately
    }

    // Update sessionStorage when state changes (backup sync)
    useEffect(() => {
        setStoredCurrency(isCurrency);
    }, [isCurrency]);

    return {
        isCurrency,
        handleCurrencyChange,
    }
}