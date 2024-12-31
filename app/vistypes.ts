export type SiteUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  accessToken?: string | null;
  authorizations?: any;
  preferences?: any;
};

export type AuthContextType = {
  user: SiteUser | null;
  loading: boolean;
};

export interface Tool {
  id: string;
  title: string;
  description: string;
  baseUrl: string;
  icon: string;
}