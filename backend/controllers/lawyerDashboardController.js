const db = require('../db');

const getDashboardStats = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    
    // Return mock data for now to fix the loading error
    const stats = {
      activeCases: 12,
      totalClients: 45,
      monthlyRevenue: 28500,
      upcomingHearings: 7
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getCases = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    
    // Return mock data for now
    const cases = [
      {
        id: 1,
        title: 'Smith vs. Johnson Contract Dispute',
        type: 'civil',
        status: 'active',
        filing_date: '2024-12-01',
        created_at: '2024-12-01T10:00:00Z'
      },
      {
        id: 2,
        title: 'Estate Planning - Williams Family',
        type: 'family',
        status: 'pending',
        filing_date: '2024-12-05',
        created_at: '2024-12-05T14:30:00Z'
      }
    ];

    res.json({
      success: true,
      data: cases
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createCase = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const { title, type, description, filing_date } = req.body;

    if (!title || !type) {
      return res.status(400).json({ success: false, error: 'Title and type are required' });
    }

    // Mock case creation for now
    const newCase = {
      id: Date.now(),
      title,
      type,
      description: description || '',
      status: 'active',
      filing_date: filing_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      message: 'Case created successfully', 
      data: newCase 
    });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getClients = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    
    // Return mock data for now
    const clients = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 987-6543'
      },
      {
        id: 3,
        name: 'Michael Williams',
        email: 'michael.williams@email.com',
        phone: '(555) 456-7890'
      }
    ];

    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const appointments = await db('appointments')
      .select('id', 'title', 'client_name', 'date', 'type')
      .where('lawyer_id', lawyerId)
      .orderBy('date', 'asc');

    const processedAppointments = appointments.map(apt => ({
      id: apt.id,
      title: apt.title,
      client_name: apt.client_name,
      date: apt.date,
      time: '10:00 AM', // Default time
      type: apt.type,
      status: 'scheduled'
    }));

    res.json(processedAppointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDocuments = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const documents = await db('documents')
      .select('id', 'filename as name', 'case_id', 'upload_date', 'file_path')
      .where('lawyer_id', lawyerId)
      .orderBy('upload_date', 'desc');

    const processedDocuments = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      case_id: doc.case_id,
      uploaded_at: doc.upload_date,
      file_url: doc.file_path,
      file_size: '2.5 MB' // Default size
    }));

    res.json(processedDocuments);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getInvoices = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    
    // Return mock data for now
    const invoices = [
      {
        id: 1,
        amount: 2500,
        status: 'paid',
        created_at: '2024-12-01T10:00:00Z'
      },
      {
        id: 2,
        amount: 1800,
        status: 'pending',
        created_at: '2024-12-05T14:30:00Z'
      },
      {
        id: 3,
        amount: 3200,
        status: 'sent',
        created_at: '2024-12-10T09:15:00Z'
      }
    ];

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const lawyer = await db('lawyers')
      .select('id', 'name', 'email', 'registration_id', 'law_firm', 'speciality', 'mobile_number', 'address', 'city', 'state', 'is_verified', 'lawyer_verified')
      .where('id', lawyerId)
      .first();

    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    res.json({
      id: lawyer.id,
      name: lawyer.name,
      email: lawyer.email,
      registration_id: lawyer.registration_id,
      law_firm: lawyer.law_firm,
      speciality: lawyer.speciality,
      mobile_number: lawyer.mobile_number,
      address: lawyer.address,
      city: lawyer.city,
      state: lawyer.state,
      verified: lawyer.is_verified === 1,
      lawyer_verified: lawyer.lawyer_verified === 1
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getCases,
  createCase,
  getClients,
  getAppointments,
  getDocuments,
  getInvoices,
  getProfile
};