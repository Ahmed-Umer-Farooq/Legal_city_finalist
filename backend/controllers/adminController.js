const db = require('../db');

const getStats = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await db('users').count('id as count').first();
    const totalLawyers = await db('lawyers').count('id as count').first();
    const verifiedLawyers = await db('lawyers').where('is_verified', 1).count('id as count').first();
    const unverifiedLawyers = await db('lawyers').where('is_verified', 0).count('id as count').first();

    // Get recent users (last 10)
    const recentUsers = await db('users')
      .select('id', 'name', 'email', 'created_at', 'is_verified', 'role')
      .orderBy('created_at', 'desc')
      .limit(10);

    // Get recent lawyers (last 10)
    const recentLawyers = await db('lawyers')
      .select('id', 'name', 'email', 'created_at', 'is_verified', 'lawyer_verified')
      .orderBy('created_at', 'desc')
      .limit(10);

    const stats = {
      totalUsers: totalUsers.count || 0,
      totalLawyers: totalLawyers.count || 0,
      verifiedLawyers: verifiedLawyers.count || 0,
      unverifiedLawyers: unverifiedLawyers.count || 0
    };

    res.json({
      stats,
      recentUsers: recentUsers.map(user => ({
        ...user,
        createdAt: user.created_at,
        verified: user.is_verified === 1
      })),
      recentLawyers: recentLawyers.map(lawyer => ({
        ...lawyer,
        createdAt: lawyer.created_at,
        verified: lawyer.is_verified === 1 || lawyer.lawyer_verified === 1
      }))
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;
    const offset = (page - 1) * limit;

    let query = db('users').select('*');

    if (search) {
      query = query.where(function() {
        this.where('name', 'like', `%${search}%`)
            .orWhere('email', 'like', `%${search}%`);
      });
    }

    if (role && role !== 'all') {
      if (role === 'admin') {
        query = query.where('is_admin', 1).orWhere('role', 'admin');
      } else {
        query = query.where('role', role);
      }
    }

    const total = await query.clone().count('id as count').first();
    const users = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getLawyers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', verified } = req.query;
    const offset = (page - 1) * limit;

    let query = db('lawyers').select('*');

    if (search) {
      query = query.where(function() {
        this.where('name', 'like', `%${search}%`)
            .orWhere('email', 'like', `%${search}%`)
            .orWhere('registration_id', 'like', `%${search}%`);
      });
    }

    if (verified !== undefined && verified !== 'all') {
      const isVerified = verified === 'true' || verified === 'verified';
      query = query.where('is_verified', isVerified ? 1 : 0);
    }

    const total = await query.clone().count('id as count').first();
    const lawyers = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);

    res.json({
      lawyers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    res.status(500).json({ error: 'Failed to fetch lawyers' });
  }
};

const verifyLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db('lawyers').where('id', id).update({
      is_verified: 1,
      lawyer_verified: 1,
      updated_at: db.fn.now()
    });

    res.json({ message: 'Lawyer verified successfully' });
  } catch (error) {
    console.error('Error verifying lawyer:', error);
    res.status(500).json({ error: 'Failed to verify lawyer' });
  }
};

const rejectLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db('lawyers').where('id', id).update({
      is_verified: 0,
      lawyer_verified: 0,
      updated_at: db.fn.now()
    });

    res.json({ message: 'Lawyer verification rejected' });
  } catch (error) {
    console.error('Error rejecting lawyer:', error);
    res.status(500).json({ error: 'Failed to reject lawyer' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await db('users').where('id', id).del();
    
    if (deleted) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const deleteLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await db('lawyers').where('id', id).del();
    
    if (deleted) {
      res.json({ message: 'Lawyer deleted successfully' });
    } else {
      res.status(404).json({ error: 'Lawyer not found' });
    }
  } catch (error) {
    console.error('Error deleting lawyer:', error);
    res.status(500).json({ error: 'Failed to delete lawyer' });
  }
};

const makeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db('users').where('id', id).update({
      is_admin: 1,
      role: 'admin',
      updated_at: db.fn.now()
    });

    res.json({ message: 'Admin access granted successfully' });
  } catch (error) {
    console.error('Error granting admin access:', error);
    res.status(500).json({ error: 'Failed to grant admin access' });
  }
};

const removeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db('users').where('id', id).update({
      is_admin: 0,
      role: 'user',
      updated_at: db.fn.now()
    });

    res.json({ message: 'Admin access removed successfully' });
  } catch (error) {
    console.error('Error removing admin access:', error);
    res.status(500).json({ error: 'Failed to remove admin access' });
  }
};

module.exports = {
  getStats,
  getUsers,
  getLawyers,
  verifyLawyer,
  rejectLawyer,
  deleteUser,
  deleteLawyer,
  makeAdmin,
  removeAdmin
};