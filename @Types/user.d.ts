type Role = 'USER' | 'ADMIN';

interface CurrentUser {
  id: string;
  phoneNumber: string;
  username: string | null;
  firstname: string | null;
  lastname: string | null;
  roles: Role[];
}
