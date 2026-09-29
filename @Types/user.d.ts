type Role = 'ADMIN' | 'USER';

interface CurrentUser {
  firstname: string | null;
  id: string;
  lastname: string | null;
  phoneNumber: string;
  roles: Role[];
  username: string | null;
}
