import { Router } from 'express';
import { User } from './User.js';

const router = Router();

// List users (basic fields)
router.get('/users', async (req,res)=>{
  try {
    const users = await User.find({}).select('email displayName role preferences.currency');
    res.json(users);
  } catch(e){
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// Promote user to Administrator
router.post('/users/:id/promote', async (req,res)=>{
  try {
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({ error: 'User not found' });
    user.role = 'Administrator';
    await user.save();
    res.json({ ok:true, role:user.role });
  } catch(e){
    res.status(500).json({ error: 'Promotion failed' });
  }
});

// Demote user to regular User
router.post('/users/:id/demote', async (req,res)=>{
  try {
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({ error: 'User not found' });
    user.role = 'User';
    await user.save();
    res.json({ ok:true, role:user.role });
  } catch(e){
    res.status(500).json({ error: 'Demotion failed' });
  }
});

export default router;