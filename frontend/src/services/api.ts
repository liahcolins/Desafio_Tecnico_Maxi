import axios from 'axios';

// Definição da URL base da API do .NET configurada no launchSettings.json (perfil http)
const API_BASE_URL = 'http://localhost:5206/api';

export interface Person {
  id: string;
  name: string;
  age: number;
}

export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: 'despesa' | 'receita';
  personId: string;
  person?: Person;
}

export interface PersonTotal {
  id: string;
  name: string;
  age: number;
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
}

export interface TotalsReport {
  people: PersonTotal[];
  grandTotalRevenue: number;
  grandTotalExpenses: number;
  grandNetBalance: number;
}

// Instância personalizada do Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const peopleService = {
  getAll: async () => {
    const response = await api.get<Person[]>('/people');
    return response.data;
  },
  create: async (name: string, age: number) => {
    const response = await api.post<Person>('/people', { name, age });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/people/${id}`);
    return response.data;
  },
};

export const transactionsService = {
  getAll: async () => {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  },
  create: async (description: string, value: number, type: 'despesa' | 'receita', personId: string) => {
    const response = await api.post<Transaction>('/transactions', {
      description,
      value,
      type,
      personId,
    });
    return response.data;
  },
};

export const totalsService = {
  getReport: async () => {
    const response = await api.get<TotalsReport>('/totals');
    return response.data;
  },
};

export default api;
