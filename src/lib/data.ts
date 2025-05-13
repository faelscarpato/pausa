
import { Operator } from "@/types/attendance";

export const operators: Operator[] = [
  { id: "op1", name: "Operador 1", role: "operator", isSupervisor: false },
  { id: "op2", name: "Operador 2", role: "operator", isSupervisor: false },
  { id: "op3", name: "Operador 3", role: "operator", isSupervisor: false },
  { id: "op4", name: "Operador 4", role: "operator", isSupervisor: false },
  { id: "op5", name: "Operador 5", role: "operator", isSupervisor: false },
  { id: "gabriel", name: "GABRIEL", role: "supervisor", isSupervisor: true },
  { id: "op7", name: "Operador 7", role: "operator", isSupervisor: false },
  { id: "op8", name: "Operador 8", role: "operator", isSupervisor: false },
  { id: "op9", name: "Operador 9", role: "operator", isSupervisor: false },
  { id: "op10", name: "Operador 10", role: "operator", isSupervisor: false },
  { id: "op11", name: "Operador 11", role: "operator", isSupervisor: false },
  { id: "thais", name: "THAIS", role: "supervisor", isSupervisor: true },
  { id: "op13", name: "Operador 13", role: "operator", isSupervisor: false },
  { id: "op14", name: "Operador 14", role: "operator", isSupervisor: false },
  { id: "op15", name: "Operador 15", role: "operator", isSupervisor: false },
  { id: "op16", name: "Operador 16", role: "operator", isSupervisor: false },
  { id: "op17", name: "Operador 17", role: "operator", isSupervisor: false },
  { id: "evaldo", name: "EVALDO", role: "supervisor", isSupervisor: true },
  { id: "op19", name: "Operador 19", role: "operator", isSupervisor: false },
  { id: "op20", name: "Operador 20", role: "operator", isSupervisor: false },
  { id: "op21", name: "Operador 21", role: "operator", isSupervisor: false },
  { id: "op22", name: "Operador 22", role: "operator", isSupervisor: false },
  { id: "op23", name: "Operador 23", role: "operator", isSupervisor: false },
  { id: "maria", name: "MARIA", role: "supervisor", isSupervisor: true },
  { id: "op25", name: "Operador 25", role: "operator", isSupervisor: false },
  { id: "op26", name: "Operador 26", role: "operator", isSupervisor: false },
  { id: "op27", name: "Operador 27", role: "operator", isSupervisor: false },
  { id: "op28", name: "Operador 28", role: "operator", isSupervisor: false },
  { id: "op29", name: "Operador 29", role: "operator", isSupervisor: false },
  { id: "kelly", name: "KELLY", role: "supervisor", isSupervisor: true },
  { id: "op31", name: "Operador 31", role: "operator", isSupervisor: false },
  { id: "op32", name: "Operador 32", role: "operator", isSupervisor: false },
  { id: "op33", name: "Operador 33", role: "operator", isSupervisor: false },
  { id: "op34", name: "Operador 34", role: "operator", isSupervisor: false },
  { id: "op35", name: "Operador 35", role: "operator", isSupervisor: false },
  { id: "vitoria", name: "VITÓRIA", role: "supervisor", isSupervisor: true },
  { id: "op37", name: "Operador 37", role: "operator", isSupervisor: false },
  { id: "op38", name: "Operador 38", role: "operator", isSupervisor: false },
  { id: "op39", name: "Operador 39", role: "operator", isSupervisor: false },
  { id: "emanuel", name: "EMANUEL", role: "supervisor", isSupervisor: true },
];

export const breakAssignments = [
  { supervisorId: "gabriel", operatorIds: ["op1", "op2", "op3", "op4", "op5"] },
  { supervisorId: "thais", operatorIds: ["op7", "op8", "op9", "op10", "op11"] },
  { supervisorId: "evaldo", operatorIds: ["op13", "op14", "op15", "op16", "op17"] },
  { supervisorId: "maria", operatorIds: ["op19", "op20", "op21", "op22", "op23"] },
  { supervisorId: "kelly", operatorIds: ["op25", "op26", "op27", "op28", "op29"] },
  { supervisorId: "vitoria", operatorIds: ["op31", "op32", "op33", "op34", "op35"] },
  { supervisorId: "emanuel", operatorIds: ["op37", "op38", "op39"] },
];

export const getOperatorById = (id: string): Operator | undefined => {
  return operators.find(op => op.id === id);
};

export const getSupervisorForOperator = (operatorId: string): Operator | undefined => {
  const assignment = breakAssignments.find(ba => ba.operatorIds.includes(operatorId));
  if (assignment) {
    return operators.find(op => op.id === assignment.supervisorId);
  }
  return undefined;
};

export const getOperatorsForSupervisor = (supervisorId: string): Operator[] => {
  const assignment = breakAssignments.find(ba => ba.supervisorId === supervisorId);
  if (!assignment) return [];
  
  return assignment.operatorIds
    .map(id => operators.find(op => op.id === id))
    .filter((op): op is Operator => op !== undefined);
};

export const getSupervisors = (): Operator[] => {
  return operators.filter(op => op.isSupervisor);
};

export const getOperators = (): Operator[] => {
  return operators.filter(op => !op.isSupervisor);
};

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
