export type User = {
  uid: string;
  email: string | null;
  photoUrl: string | null;
  displayName: string | null;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
};