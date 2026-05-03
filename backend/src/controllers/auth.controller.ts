import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../store/sqlite.store';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

function loadMockUsers(): Map<string, string> {
  const raw = process.env.MOCK_USERS ?? 'admin:admin123,demo:demo2024';
  const map = new Map<string, string>();

  raw.split(',').forEach(pair => {
    const [username, password] = pair.trim().split(':');
    if (username && password) {
      const existing = store.getUserByUsername(username);
      const userId = existing?.id ?? uuidv4();
      if (!existing) store.addUser({ id: userId, username });
      map.set(username, password);
    }
  });

  return map;
}

const credentials = loadMockUsers();

export function login(req: Request, res: Response): void {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Username and password are required' });
    return;
  }

  const expected = credentials.get(username);
  if (!expected || expected !== password) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const user = store.getUserByUsername(username);
  if (!user) {
    res.status(500).json({ success: false, error: 'User record missing' });
    return;
  }

  const token = uuidv4();
  store.createSession({ token, userId: user.id, username: user.username, createdAt: new Date() });

  res.json({ success: true, data: { token, user: { id: user.id, username: user.username } } });
}

export function logout(req: Request, res: Response): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    store.deleteSession(authHeader.slice(7));
  }
  res.json({ success: true });
}

export function me(req: Request, res: Response): void {
  const { userId, username } = req as AuthenticatedRequest;
  res.json({ success: true, data: { userId, username } });
}
