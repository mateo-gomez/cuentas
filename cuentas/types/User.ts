export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  surename: string;
  lastname: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDTO = Omit<User, "_id" | "createdAt" | "updatedAt">;
