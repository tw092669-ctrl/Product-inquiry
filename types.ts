export type EnvironmentType = 'heating' | 'cooling' | 'both' | 'indoor-unit';

export interface ConfigOption {
  id: string;
  label: string;
  color: string; // Tailwind text color class or hex
}

export interface AppConfig {
  brands: ConfigOption[];
  styles: ConfigOption[];
  types: ConfigOption[];
  pipes: ConfigOption[];
}

export interface Dimensions {
  indoor: string;
  outdoor: string;
}

export interface Product {
  id: string;
  name: string;
  brandId: string;
  styleId: string;
  typeId: string;
  pipeId: string;
  environment: EnvironmentType; // 'heating' (Sun) or 'cooling' (Snow)
  dimensions: Dimensions;
  price: number | string;
  remarks: string; // Hidden, for model search
  isPinned: boolean;
  createdAt: number;
}

export type CategoryType = 'air-conditioning' | 'multi-unit' | 'materials' | 'tools' | 'high-altitude';

export interface MiscItem {
  id: string;
  category: CategoryType;
  name: string;
  specification: string;
  unit: string;
  price: number | string;
  remarks: string;
  createdAt: number;
}