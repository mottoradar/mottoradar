export type Moto = {
  id: number;
  brand: string;
  model: string;
  version: string;
  year: number;
  km: number;
  price: number;
  city: string;
  state: string;
  source: string;
  url: string;
  updatedAt: string;
  featured?: boolean;
};

// Exemplos fictícios para demonstrar a interface. Não são ofertas reais.
export const motosDemo: Moto[] = [
  { id: 1, brand: 'Honda', model: 'CG 160', version: 'Fan', year: 2023, km: 12400, price: 15900, city: 'Rio de Janeiro', state: 'RJ', source: 'Demonstração', url: '#', updatedAt: 'Exemplo visual', featured: true },
  { id: 2, brand: 'Yamaha', model: 'Fazer 250', version: 'FZ25', year: 2022, km: 18700, price: 19800, city: 'Niterói', state: 'RJ', source: 'Demonstração', url: '#', updatedAt: 'Exemplo visual' },
  { id: 3, brand: 'Honda', model: 'Biz 125', version: 'ES', year: 2024, km: 6300, price: 14200, city: 'Duque de Caxias', state: 'RJ', source: 'Demonstração', url: '#', updatedAt: 'Exemplo visual' },
  { id: 4, brand: 'Yamaha', model: 'Factor 150', version: 'ED', year: 2021, km: 25300, price: 11900, city: 'Belford Roxo', state: 'RJ', source: 'Demonstração', url: '#', updatedAt: 'Exemplo visual' },
  { id: 5, brand: 'Honda', model: 'XRE 300', version: 'ABS', year: 2022, km: 16100, price: 26400, city: 'São Gonçalo', state: 'RJ', source: 'Demonstração', url: '#', updatedAt: 'Exemplo visual' },
  { id: 6, brand: 'Bajaj', model: 'Dominar 400', version: 'Touring', year: 2024, km: 4900, price: 23900, city: 'Rio de Janeiro', state: 'RJ', source: 'Demonstração', url: '#', updatedAt: 'Exemplo visual' },
];

export const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const km = (value: number) => `${value.toLocaleString('pt-BR')} km`;
