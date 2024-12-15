export type User = {
  uid: string;
  email: string | null;
  photoURL: string | null;
  displayName: string | null;
  authorizations?: any;
  accessToken?: string | null;
  refreshToken?: string | null;
};

export type UserData = {
  message: string;
  success: boolean;
  user: User;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
};

export interface Tool {
  id: string;
  title: string;
  description: string;
  baseUrl: string;
  icon: string;
}