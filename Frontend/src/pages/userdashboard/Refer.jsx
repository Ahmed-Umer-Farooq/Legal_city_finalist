import React, { useState } from 'react';
import { Share2, Copy, Mail, MessageCircle, Users, Gift, DollarSign, Phone, ExternalLink } from 'lucide-react';

const Refer = () => {
  const [formData, setFormData] = useState({
    friend_name: '',
    friend_email: '',
    friend_phone: '',
    referral_link: 'http://invitefriend.com'
  });
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const [referrals] = useState([
    { id: 1, name: 'John Smith', status: 'Pending', date: '2024-12-10', reward: '$50' },
    { id: 2, name: 'Sarah Johnson', status: 'Completed', date: '2024-12-08', reward: '$50' },
    { id: 3, name: 'Mike Wilson', status: 'Completed', date: '2024-12-05', reward: '$50' }
  ]);

  const rewardTiers = [
    { thresholdFriends: 50, voucherAmount: 100, headline: 'Earn $100 voucher referring 50 Friends', note: 'Get $100 voucher on registration!' },
    { thresholdFriends: 100, voucherAmount: 500, headline: 'Earn $500 voucher referring 100 Friends', note: 'Get $500 voucher on registration!' },
    { thresholdFriends: 200, voucherAmount: 1000, headline: 'Earn $1000 voucher referring 200 Friends', note: 'Get $1000 voucher on registration!' }
  ];

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'friend_name':
        if (!value.trim()) {
          newErrors.friend_name = 'Friend\'s name is required';
        } else if (value.length < 2 || value.length > 80) {
          newErrors.friend_name = 'Name must be between 2 and 80 characters';
        } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'.\-\s]+$/.test(value)) {
          newErrors.friend_name = 'Name contains invalid characters';
        } else {
          delete newErrors.friend_name;
        }
        break;
      case 'friend_email':
        if (!value.trim()) {
          newErrors.friend_email = 'Friend\'s email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.friend_email = 'Please enter a valid email address';
        } else if (value.length > 254) {
          newErrors.friend_email = 'Email is too long';
        } else {
          delete newErrors.friend_email;
        }
        break;
      case 'friend_phone':
        if (value && !/^\+?[0-9\-()\s]{7,20}$/.test(value)) {
          newErrors.friend_phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.friend_phone;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const trimmedValue = name !== 'friend_phone' ? value.trim() : value;
    setFormData(prev => ({ ...prev, [name]: trimmedValue }));
    validateField(name, trimmedValue);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(formData.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReferral = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {};
    if (!formData.friend_name.trim()) newErrors.friend_name = 'Friend\'s name is required';
    if (!formData.friend_email.trim()) newErrors.friend_email = 'Friend\'s email is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit referral logic here
    console.log('Submitting referral:', formData);
    alert('Referral submitted successfully!');
    
    // Reset form
    setFormData({
      friend_name: '',
      friend_email: '',
      friend_phone: '',
      referral_link: 'http://invitefriend.com'
    });
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(`Join Legal City and earn rewards! Use my link: ${formData.referral_link}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const navigateToPrograms = () => {
    // Navigate to programs page
    window.open('/programs', '_blank');
  };

  const isFormValid = formData.friend_name.trim() && formData.friend_email.trim() && Object.keys(errors).length === 0;

  return (
    <div className="space-y-8 p-6">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Great Reference Comes With Great Rewards!</h1>
        <p className="text-lg opacity-90">Fast forward your friends carrier NOW! Get Voucher Of $100!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Referrals', value: referrals.length, icon: Users, color: 'bg-blue-500' },
          { label: 'Completed', value: referrals.filter(r => r.status === 'Completed').length, icon: Gift, color: 'bg-green-500' },
          { label: 'Pending', value: referrals.filter(r => r.status === 'Pending').length, icon: MessageCircle, color: 'bg-yellow-500' },
          { label: 'Total Earned', value: '$100', icon: DollarSign, color: 'bg-purple-500' }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Referral Form */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Referral</h2>
        <p className="text-gray-600 mb-6">Invite friends to Legal City and earn voucher rewards.</p>
        
        <form onSubmit={handleSubmitReferral} className="space-y-4">
          <div>
            <label htmlFor="friend_name" className="block text-sm font-medium text-gray-700 mb-1">
              Friend's name *
            </label>
            <input
              type="text"
              id="friend_name"
              name="friend_name"
              value={formData.friend_name}
              onChange={handleInputChange}
              placeholder="Enter your friend's full name"
              autoComplete="name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.friend_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.friend_name && <p className="text-red-500 text-sm mt-1">{errors.friend_name}</p>}
          </div>

          <div>
            <label htmlFor="friend_email" className="block text-sm font-medium text-gray-700 mb-1">
              Friend's email address *
            </label>
            <input
              type="email"
              id="friend_email"
              name="friend_email"
              value={formData.friend_email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              autoComplete="email"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.friend_email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.friend_email && <p className="text-red-500 text-sm mt-1">{errors.friend_email}</p>}
          </div>

          <div>
            <label htmlFor="friend_phone" className="block text-sm font-medium text-gray-700 mb-1">
              Friend's phone number
            </label>
            <input
              type="tel"
              id="friend_phone"
              name="friend_phone"
              value={formData.friend_phone}
              onChange={handleInputChange}
              placeholder="+1 555 123 4567"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.friend_phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="text-sm text-gray-500 mt-1">Optional</p>
            {errors.friend_phone && <p className="text-red-500 text-sm mt-1">{errors.friend_phone}</p>}
          </div>

          <div>
            <label htmlFor="referral_link" className="block text-sm font-medium text-gray-700 mb-1">
              Your referral link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                id="referral_link"
                name="referral_link"
                value={formData.referral_link}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <button
                type="button"
                onClick={copyReferralLink}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  copied ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                isFormValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              aria-label="Submit your friend's details to refer"
            >
              Refer A Friend
            </button>
            
            <button
              type="button"
              onClick={shareWhatsApp}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              aria-label="Share your referral link on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              Share via WhatsApp
            </button>
            
            <button
              type="button"
              onClick={navigateToPrograms}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Refer your friends to upskill with Legal Lawyer programs
            </button>
          </div>
        </form>
      </div>

      {/* Reward Tiers */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Reward Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rewardTiers.map((tier, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-lg text-gray-900 mb-2">{tier.headline}</h4>
              <p className="text-sm text-gray-600 mb-4">{tier.note}</p>
              <div className="text-2xl font-bold text-blue-600">${tier.voucherAmount}</div>
              <div className="text-sm text-gray-500">{tier.thresholdFriends} friends</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">1. Share Your Link</h3>
            <p className="text-sm opacity-90">Send your unique referral link to friends</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">2. They Sign Up</h3>
            <p className="text-sm opacity-90">Your friends register using your link</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">3. Earn Rewards</h3>
            <p className="text-sm opacity-90">Get vouchers based on successful referrals</p>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Referral History</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {referrals.map(referral => (
            <div key={referral.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{referral.name}</h4>
                  <p className="text-sm text-gray-500">Referred on {new Date(referral.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  referral.status === 'Completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {referral.status}
                </span>
                <span className="font-semibold text-gray-900">{referral.reward}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-3">Terms & Conditions</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Earn vouchers for each successful referral who completes registration</li>
          <li>• Referral must use your unique link during signup</li>
          <li>• Rewards are processed within 7 business days</li>
          <li>• Self-referrals and duplicate accounts are not eligible</li>
          <li>• Voucher amounts vary based on referral tiers (50, 100, 200 friends)</li>
        </ul>
      </div>
    </div>
  );
};

export default Refer;