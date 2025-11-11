import { Router } from 'express';
import { User } from './User.js';
import { Transaction } from './Transaction.js';

const router = Router();

// List users
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

// Delete user account
router.delete('/users/:id', async (req,res)=>{
  try {
    const targetUserId = req.params.id;
    const adminUserId = req.userId;

    // Prevent self-deletion
    if(targetUserId === adminUserId){
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const targetUser = await User.findById(targetUserId);
    if(!targetUser) return res.status(404).json({ error: 'User not found' });

    // Prevent deleting the last administrator
    if(targetUser.role === 'Administrator'){
      const adminCount = await User.countDocuments({ role: 'Administrator' });
      if(adminCount <= 1){
        return res.status(400).json({ error: 'Cannot delete the last administrator' });
      }
    }

    // Delete user's transactions
    await Transaction.deleteMany({ userId: targetUserId });
    
    // Delete user
    await User.findByIdAndDelete(targetUserId);
    
    res.json({ ok: true, message: 'User deleted successfully' });
  } catch(e){
    res.status(500).json({ error: 'Deletion failed' });
  }
});

export default router;