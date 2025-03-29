import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import { CreateUserDTO } from '../types/userSchema';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, ...updateData } = req.body as CreateUserDTO; // Exclude `id` from the update data
    const user = await userService.updateUser(Number(req.params.id), updateData);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return; // Explicitly return after sending the response
    }
    res.json(apiResponse(user, 'User updated'));
  } catch (err) {
    logger.error(`updateUser error: ${err}`);
    next(err);
  }
};

export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await userService.getUsersByRole(_req.params.role);

    if (!users) {
      res.status(404).json({ error: 'No users found' });
      return; // Explicitly return after sending the response
    }
    logger.info('Fetched all users');
    res.json(apiResponse(users));
  } catch (err) {
    logger.error(`getUsers error: ${err}`);
    next(err);
  }
};

export const getUser = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.getUserById(Number(_req.params.id));
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return; // Explicitly return after sending the response
    }
    res.json(apiResponse(user));
  } catch (err) {
    logger.error(`getUser error: ${err}`); // Added logging for getUser errors
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.createUser(req.body as CreateUserDTO);
    logger.info(`Created user ${user.id}`);
    res.status(201).json(apiResponse(user, 'User created'));
  } catch (err) {
    logger.error(`createUser error: ${err}`);
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const success = await userService.deleteUser(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'User not found' });
      return; // Explicitly return after sending the response
    }
    res.json(apiResponse(null, 'User deleted'));
  } catch (err) {
    next(err);
  }
};