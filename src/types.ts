interface SiteAuthAttributes {
  role: 'admin' | 'collaborator' | 'owner';
  read: boolean;
  write: boolean;
  delete: boolean;
}

type Authorizations = {
  inventory: Record<string, SiteAuthAttributes>
}

export type User = {
  uid: string;
  email: string | null;
  photoURL: string | null;
  displayName: string | null;
  authorizations?: Authorizations;
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