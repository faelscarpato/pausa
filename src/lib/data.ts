
import { Operator } from "@/types/attendance";

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateBR = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Adding the missing getOperators function
export const getOperators = (): Operator[] => {
  return [
    { id: 1, name: "Operador 1" },
    { id: 2, name: "Operador 2" },
    { id: 3, name: "Operador 3" },
    { id: 4, name: "Operador 4" },
    { id: 5, name: "Operador 5" },
  ];
};
