import { CreateUserDTO } from '../types/userSchema';

interface User extends CreateUserDTO {
}

let users: User[] = [];

export const getAllUsers = async (): Promise<User[]> => users;

export const createUser = async (data: CreateUserDTO): Promise<User> => {
  const newUser = {...data };
  users.push(newUser);
  return newUser;
};

export const getUserById = async (id: number): Promise<User | null> => {
  return users.find(user => user.id === id) || null;
};

export const getUsersByRole = async (role: string): Promise<User[]> => {
  return users.filter(user => user.role === role);
}

export const deleteUser = async (id: number): Promise<boolean> => {
  const initialLength = users.length;
  users = users.filter(user => user.id !== id);
  return users.length < initialLength;
};

export const updateUser = async (id: number, data: Partial<CreateUserDTO>): Promise<User | null> => {
  const user = users.find(user => user.id === id);
  if (!user) return null;
  delete data.id; // Ensure `id` is not updated
  Object.assign(user, data);
  return user;
};