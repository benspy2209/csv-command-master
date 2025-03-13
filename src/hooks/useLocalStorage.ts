
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // État pour stocker notre valeur
  // Passer la fonction d'initialisation à useState pour que 
  // la logique ne s'exécute qu'une seule fois
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Récupération depuis localStorage
      const item = window.localStorage.getItem(key);
      // Retourner la valeur parsée ou initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // En cas d'erreur, retourner initialValue
      console.error("Error reading from localStorage", error);
      return initialValue;
    }
  });

  // Retourner une fonction de mise à jour enveloppée qui persistera
  // la nouvelle valeur dans localStorage.
  const setValue = (value: T) => {
    try {
      // Autoriser la valeur à être une fonction pour compatibilité avec useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Sauvegarde de l'état
      setStoredValue(valueToStore);
      // Sauvegarde dans localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  };

  return [storedValue, setValue];
}
