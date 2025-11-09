import jwt from 'jsonwebtoken';
import { User } from './User.js';

export async function adminRequired(req, res, next){
  const auth = req.headers.authorization;
  if(!auth || !auth.startsWith('Bearer ')){
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = auth.substring(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('role');
    if(!user) return res.status(401).json({ error: 'Invalid user' });
    if(user.role !== 'Administrator') return res.status(403).json({ error: 'Forbidden' });
    req.userId = payload.sub;
    req.userRole = user.role;
    next();
  } catch(e){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export default adminRequired;
