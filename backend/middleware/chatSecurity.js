const jwt = require('jsonwebtoken');
const db = require('../db');

// Active chat sessions tracking
const activeChatSessions = new Map();

const validateChatAccess = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if user exists and get user type
    let user = await db('users').where('id', userId).first();
    let userType = 'user';
    
    if (!user) {
      user = await db('lawyers').where('id', userId).first();
      userType = 'lawyer';
    }

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // Create unique session identifier
    const sessionId = `${userId}_${userType}_${Date.now()}`;
    
    // Store session info
    req.chatSession = {
      userId,
      userType,
      sessionId,
      user
    };

    // Track active session
    activeChatSessions.set(sessionId, {
      userId,
      userType,
      timestamp: Date.now()
    });

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const validateMessageAccess = async (req, res, next) => {
  try {
    const { userId, userType } = req.chatSession;
    const { partnerId, partnerType } = req.params;

    // Validate that user can only access their own conversations
    if (req.method === 'GET') {
      // For GET requests, ensure user is either sender or receiver
      const hasAccess = await db('chat_messages')
        .where(function() {
          this.where({
            sender_id: userId,
            sender_type: userType,
            receiver_id: partnerId,
            receiver_type: partnerType
          }).orWhere({
            sender_id: partnerId,
            sender_type: partnerType,
            receiver_id: userId,
            receiver_type: userType
          });
        })
        .first();

      if (!hasAccess) {
        // Allow if no messages exist yet (new conversation)
        const partnerExists = partnerType === 'lawyer' 
          ? await db('lawyers').where('id', partnerId).first()
          : await db('users').where('id', partnerId).first();
          
        if (!partnerExists) {
          return res.status(404).json({ error: 'Partner not found' });
        }
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Access validation failed' });
  }
};

const validateConversationOwnership = async (req, res, next) => {
  try {
    const { userId, userType } = req.chatSession;

    // Override query to only return user's own conversations
    req.userFilter = {
      userId,
      userType
    };

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Ownership validation failed' });
  }
};

const cleanupInactiveSessions = () => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes

  for (const [sessionId, session] of activeChatSessions.entries()) {
    if (now - session.timestamp > maxAge) {
      activeChatSessions.delete(sessionId);
    }
  }
};

// Cleanup inactive sessions every 5 minutes
setInterval(cleanupInactiveSessions, 5 * 60 * 1000);

module.exports = {
  validateChatAccess,
  validateMessageAccess,
  validateConversationOwnership,
  activeChatSessions
};