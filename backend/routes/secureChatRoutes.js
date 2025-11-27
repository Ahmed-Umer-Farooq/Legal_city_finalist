const express = require('express');
const router = express.Router();
const db = require('../db');
const { validateChatAccess, validateMessageAccess, validateConversationOwnership } = require('../middleware/chatSecurity');

// Get all conversations for authenticated user only
router.get('/conversations', validateChatAccess, validateConversationOwnership, async (req, res) => {
  try {
    const { userId, userType } = req.chatSession;
    
    console.log(`Fetching conversations for user ${userId} (${userType})`);
    
    let conversations = await db('chat_messages')
      .select(
        db.raw(`
          CASE 
            WHEN sender_id = ? AND sender_type = ? THEN receiver_id
            ELSE sender_id
          END as partner_id
        `, [userId, userType]),
        db.raw(`
          CASE 
            WHEN sender_id = ? AND sender_type = ? THEN receiver_type
            ELSE sender_type
          END as partner_type
        `, [userId, userType]),
        db.raw('MAX(created_at) as last_message_time'),
        db.raw('COUNT(CASE WHEN read_status = 0 AND receiver_id = ? AND receiver_type = ? THEN 1 END) as unread_count', [userId, userType])
      )
      .where(function() {
        this.where({ sender_id: userId, sender_type: userType })
          .orWhere({ receiver_id: userId, receiver_type: userType });
      })
      .groupBy('partner_id', 'partner_type')
      .orderBy('last_message_time', 'desc');

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const table = conv.partner_type === 'lawyer' ? 'lawyers' : 'users';
        let partner = await db(table)
          .select('id', 'name', 'email')
          .where('id', conv.partner_id)
          .first();
        
        if (!partner) {
          console.warn(`Partner not found: ID ${conv.partner_id} in ${table} table`);
          partner = { id: conv.partner_id, name: 'Unknown User', email: null };
        }

        const lastMessage = await db('chat_messages')
          .where(function() {
            this.where({ 
              sender_id: userId, 
              sender_type: userType,
              receiver_id: conv.partner_id,
              receiver_type: conv.partner_type
            }).orWhere({ 
              sender_id: conv.partner_id,
              sender_type: conv.partner_type,
              receiver_id: userId,
              receiver_type: userType
            });
          })
          .orderBy('created_at', 'desc')
          .first();

        return {
          partner_id: conv.partner_id,
          partner_type: conv.partner_type,
          partner_name: partner?.name || 'Unknown User',
          partner_email: partner?.email,
          last_message: lastMessage?.content,
          last_message_time: conv.last_message_time,
          unread_count: conv.unread_count
        };
      })
    );

    res.json(conversationsWithDetails);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages between authenticated user and specific partner
router.get('/messages/:partnerId/:partnerType', validateChatAccess, validateMessageAccess, async (req, res) => {
  try {
    const { userId, userType } = req.chatSession;
    const { partnerId, partnerType } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    console.log(`Fetching messages between user ${userId} (${userType}) and partner ${partnerId} (${partnerType})`);

    const messages = await db('chat_messages')
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
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark conversation as read for authenticated user
router.put('/messages/read/:partnerId/:partnerType', validateChatAccess, validateMessageAccess, async (req, res) => {
  try {
    const { userId, userType } = req.chatSession;
    const { partnerId, partnerType } = req.params;

    const result = await db('chat_messages')
      .where({
        sender_id: partnerId,
        sender_type: partnerType,
        receiver_id: userId,
        receiver_type: userType,
        read_status: 0
      })
      .update({ read_status: 1 });

    res.json({ success: true, markedCount: result });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get user type and info for authenticated user
router.get('/user-type', validateChatAccess, async (req, res) => {
  try {
    const { userId, userType } = req.chatSession;
    res.json({ userType, userId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to determine user type' });
  }
});

// Get unread message count for authenticated user
router.get('/unread-count', validateChatAccess, async (req, res) => {
  try {
    const { userId, userType } = req.chatSession;
    
    const unreadCount = await db('chat_messages')
      .where({
        receiver_id: userId,
        receiver_type: userType,
        read_status: 0
      })
      .count('id as count')
      .first();

    res.json({ count: unreadCount.count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Send message (authenticated user only)
router.post('/send', validateChatAccess, async (req, res) => {
  try {
    const { userId, userType } = req.chatSession;
    const { receiver_id, receiver_type, content, message_type, file_url, file_name, file_size } = req.body;
    
    // Validate receiver exists
    const receiverTable = receiver_type === 'lawyer' ? 'lawyers' : 'users';
    const receiverExists = await db(receiverTable).where('id', receiver_id).first();
    
    if (!receiverExists) {
      return res.status(404).json({ error: 'Receiver not found' });
    }
    
    const [messageId] = await db('chat_messages').insert({
      sender_id: userId,
      sender_type: userType,
      receiver_id,
      receiver_type,
      content,
      message_type: message_type || 'text',
      file_url: file_url || null,
      file_name: file_name || null,
      file_size: file_size || null,
      read_status: false,
      created_at: new Date()
    });

    const message = await db('chat_messages').where('id', messageId).first();
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Delete conversation (authenticated user only)
router.delete('/conversation/:partnerId/:partnerType', validateChatAccess, validateMessageAccess, async (req, res) => {
  try {
    const { userId, userType } = req.chatSession;
    const { partnerId, partnerType } = req.params;

    await db('chat_messages')
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
      .delete();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

module.exports = router;