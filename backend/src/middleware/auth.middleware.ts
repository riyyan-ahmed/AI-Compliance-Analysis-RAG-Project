import { Request, Response, NextFunction } from 'express';
import { store } from '../store/sqlite.store';

export interface AuthenticatedRequest extends Request {
  userId: string;
  username: string;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);
  const session = store.getSession(token);

  if (!session) {
    res.status(401).json({ success: false, error: 'Invalid or expired session' });
    return;
  }

  (req as AuthenticatedRequest).userId = session.userId;
  (req as AuthenticatedRequest).username = session.username;
  next();
}
