export interface FirebaseUserData {
  accessToken: string;
  displayName: string | null;
  email: string | null;
  photoUrl: string | null;
  uid: string;
}

interface Privileges {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface DatabaseMetadata {
  columns?: Column[];
  databaseName: string;
  displayName: string;
  // typeOfItem: string;
  // description: string;
  // createdAt: number;
  // updatedAt: number;
}

export interface DatabaseUserData {
  databaseMetadata: DatabaseMetadata;
  privileges: Privileges;
  role: string;
}

interface UserInventoryData {
  databases: Record<string, DatabaseUserData>;
}

export interface UserDBData {
  uid: string;
  authorizations: Record<string, any>;
  displayName: string;
  email: string;
  photoURL: string;
  preferences: Record<string, any>;
}

export interface VisionaryUser {
  visionaryData: FirebaseUserData;
  inventoryData: UserInventoryData;
  preferences?: Record<string, any>;
}

export interface InventoryItem {
  [prop: string]: string | number | null;
}

export interface InventoryResponse {
  success: boolean;
  data: InventoryItem[];
}

export type GroupedItem = InventoryItem & { quantity: number };
export type SortKey = string;
export type SortDirection = 'asc' | 'desc';

export interface Column {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date';
  format?: (value: any) => string | Element;
}

export type DataItem = Record<string, any>;

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export interface LabelOption {
  shortName?: string,
  longName?: string,
  specialType?: string;
}

export interface ColumnFilter {
  prepend?: string;
  append?: string;
  replace?: Record<string | number, string | boolean>;
}

export interface InventoryGridProps {
  data: DataItem[];
  columns: Column[];
  groupIdentical: boolean;
  currentInventory: DatabaseUserData;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface GroupedDataItem extends DataItem {
  quantity?: number;
}