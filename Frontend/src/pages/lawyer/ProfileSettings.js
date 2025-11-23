import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Clock, DollarSign, Award, Calendar, MessageCircle, FileText, Star, CreditCard, Activity } from 'lucide-react';
import api from '../../utils/api';

export default function ProfileSettings() {
  const [profile, setProfile] = useState({
    email: '',
    address: '',
    hourlyRateMin: '',
    hourlyRateMax: '',
    freeConsultation: '',
    about: '',
    profileImage: '',
    name: '',
    practiceLocation: '',
    yearsLicensed: '',
    consultationType: { free: false, virtual: false },
    practiceAreas: [{ area: '', percentage: '', experience: '' }],
    avvoRating: '',
    workExperience: [{ position: '', company: '', duration: '' }],
    education: [{ degree: '', school: '', year: '' }],
    languages: [''],
    awards: [{ title: '', organization: '', year: '' }],
    associations: [{ name: '', role: '', duration: '' }],
    publications: [{ title: '', publication: '', year: '' }],
    speakingEngagements: [{ title: '', event: '', year: '' }],
    endorsements: {
      received: [{ initials: '', name: '', title: '', date: '', relationship: '', endorsement: '' }],
      given: [{ initials: '', name: '', title: '', date: '', relationship: '', endorsement: '' }]
    },
    officeHours: {
      mondayFriday: '',
      saturday: '',
      sunday: ''
    },
    caseStats: {
      divorce: '',
      custody: '',
      adoptions: '',
      childSupport: ''
    },
    paymentOptions: {
      creditCards: false,
      paymentPlans: false,
      contingencyFee: false,
      freeConsultation: false
    },
    recentActivity: [
      { action: '', time: '' },
      { action: '', time: '' },
      { action: '', time: '' }
    ]
  });


  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/lawyer/profile', profile);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#181A2A]">Profile Settings</h1>
          <p className="text-[#737791] mt-1">Manage your professional profile information</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-[#28B779] text-white px-4 py-2 rounded-lg hover:bg-[#229966] disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Profile Information */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Basic Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => setProfile({...profile, profileImage: e.target.result});
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {profile.profileImage && (
                <img src={profile.profileImage} alt="Profile" className="mt-2 w-20 h-20 object-cover rounded-lg" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                placeholder="Darlene Robertson"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Practice Location</label>
              <input
                type="text"
                value={profile.practiceLocation}
                onChange={(e) => setProfile({...profile, practiceLocation: e.target.value})}
                placeholder="London, England"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years Licensed</label>
              <input
                type="number"
                value={profile.yearsLicensed}
                onChange={(e) => setProfile({...profile, yearsLicensed: e.target.value})}
                placeholder="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Options</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={profile.consultationType.free}
                    onChange={(e) => setProfile({...profile, consultationType: {...profile.consultationType, free: e.target.checked}})}
                    className="rounded"
                  />
                  <span className="text-[#737791]">Free Consultation</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={profile.consultationType.virtual}
                    onChange={(e) => setProfile({...profile, consultationType: {...profile.consultationType, virtual: e.target.checked}})}
                    className="rounded"
                  />
                  <span className="text-[#737791]">Virtual Available</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                placeholder="darlene.robertson@lawfirm.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                placeholder="1 Station Road, London E17 8AA, London, England E17 8AA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Rates */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Rates
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Hourly Rate ($)</label>
                <input
                  type="number"
                  value={profile.hourlyRateMin}
                  onChange={(e) => setProfile({...profile, hourlyRateMin: e.target.value})}
                  placeholder="300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Hourly Rate ($)</label>
                <input
                  type="number"
                  value={profile.hourlyRateMax}
                  onChange={(e) => setProfile({...profile, hourlyRateMax: e.target.value})}
                  placeholder="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Consultation Duration</label>
              <input
                type="text"
                value={profile.freeConsultation}
                onChange={(e) => setProfile({...profile, freeConsultation: e.target.value})}
                placeholder="30 minutes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Office Hours */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Office Hours
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monday - Friday</label>
              <input
                type="text"
                value={profile.officeHours.mondayFriday}
                onChange={(e) => setProfile({...profile, officeHours: {...profile.officeHours, mondayFriday: e.target.value}})}
                placeholder="9:00 AM - 6:00 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saturday</label>
              <input
                type="text"
                value={profile.officeHours.saturday}
                onChange={(e) => setProfile({...profile, officeHours: {...profile.officeHours, saturday: e.target.value}})}
                placeholder="10:00 AM - 4:00 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sunday</label>
              <input
                type="text"
                value={profile.officeHours.sunday}
                onChange={(e) => setProfile({...profile, officeHours: {...profile.officeHours, sunday: e.target.value}})}
                placeholder="Closed"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Case Types Handled */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Case Types Handled</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Divorce Cases</label>
              <input
                type="number"
                value={profile.caseStats.divorce}
                onChange={(e) => setProfile({...profile, caseStats: {...profile.caseStats, divorce: e.target.value}})}
                placeholder="150"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custody Cases</label>
              <input
                type="number"
                value={profile.caseStats.custody}
                onChange={(e) => setProfile({...profile, caseStats: {...profile.caseStats, custody: e.target.value}})}
                placeholder="89"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adoptions</label>
              <input
                type="number"
                value={profile.caseStats.adoptions}
                onChange={(e) => setProfile({...profile, caseStats: {...profile.caseStats, adoptions: e.target.value}})}
                placeholder="45"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Child Support Cases</label>
              <input
                type="number"
                value={profile.caseStats.childSupport}
                onChange={(e) => setProfile({...profile, caseStats: {...profile.caseStats, childSupport: e.target.value}})}
                placeholder="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Options
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.paymentOptions.creditCards}
                onChange={(e) => setProfile({...profile, paymentOptions: {...profile.paymentOptions, creditCards: e.target.checked}})}
                className="rounded"
              />
              <span className="text-[#737791]">Credit Cards Accepted</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.paymentOptions.paymentPlans}
                onChange={(e) => setProfile({...profile, paymentOptions: {...profile.paymentOptions, paymentPlans: e.target.checked}})}
                className="rounded"
              />
              <span className="text-[#737791]">Payment Plans Available</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.paymentOptions.contingencyFee}
                onChange={(e) => setProfile({...profile, paymentOptions: {...profile.paymentOptions, contingencyFee: e.target.checked}})}
                className="rounded"
              />
              <span className="text-[#737791]">Contingency Fee Options</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.paymentOptions.freeConsultation}
                onChange={(e) => setProfile({...profile, paymentOptions: {...profile.paymentOptions, freeConsultation: e.target.checked}})}
                className="rounded"
              />
              <span className="text-[#737791]">Free Initial Consultation</span>
            </label>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">About</h2>
          <textarea
            value={profile.about}
            onChange={(e) => setProfile({...profile, about: e.target.value})}
            placeholder="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
        </div>

        {/* Practice Areas */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Practice Areas</h2>
          <div className="space-y-4">
            {profile.practiceAreas.map((area, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  value={area.area}
                  onChange={(e) => {
                    const newAreas = [...profile.practiceAreas];
                    newAreas[index].area = e.target.value;
                    setProfile({...profile, practiceAreas: newAreas});
                  }}
                  placeholder="Business"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={area.percentage}
                    onChange={(e) => {
                      const newAreas = [...profile.practiceAreas];
                      newAreas[index].percentage = e.target.value;
                      setProfile({...profile, practiceAreas: newAreas});
                    }}
                    placeholder="100%"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={area.experience}
                    onChange={(e) => {
                      const newAreas = [...profile.practiceAreas];
                      newAreas[index].experience = e.target.value;
                      setProfile({...profile, practiceAreas: newAreas});
                    }}
                    placeholder="11 years experience"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Resume */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">AVVO Rating</h2>
          <input
            type="text"
            value={profile.avvoRating}
            onChange={(e) => setProfile({...profile, avvoRating: e.target.value})}
            placeholder="10.0 (Superb)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Work Experience */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Work Experience</h2>
          <div className="space-y-4">
            {profile.workExperience.map((work, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  value={work.position}
                  onChange={(e) => {
                    const newWork = [...profile.workExperience];
                    newWork[index].position = e.target.value;
                    setProfile({...profile, workExperience: newWork});
                  }}
                  placeholder="Owner"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={work.company}
                  onChange={(e) => {
                    const newWork = [...profile.workExperience];
                    newWork[index].company = e.target.value;
                    setProfile({...profile, workExperience: newWork});
                  }}
                  placeholder="Family Law Center of the Rockies"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={work.duration}
                  onChange={(e) => {
                    const newWork = [...profile.workExperience];
                    newWork[index].duration = e.target.value;
                    setProfile({...profile, workExperience: newWork});
                  }}
                  placeholder="2006 - Present"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Education</h2>
          <div className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => {
                    const newEdu = [...profile.education];
                    newEdu[index].school = e.target.value;
                    setProfile({...profile, education: newEdu});
                  }}
                  placeholder="Roger Williams University"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...profile.education];
                      newEdu[index].degree = e.target.value;
                      setProfile({...profile, education: newEdu});
                    }}
                    placeholder="JD - Juris Doctor"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => {
                      const newEdu = [...profile.education];
                      newEdu[index].year = e.target.value;
                      setProfile({...profile, education: newEdu});
                    }}
                    placeholder="2006"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Languages</h2>
          <div className="space-y-2">
            {profile.languages.map((lang, index) => (
              <input
                key={index}
                type="text"
                value={lang}
                onChange={(e) => {
                  const newLangs = [...profile.languages];
                  newLangs[index] = e.target.value;
                  setProfile({...profile, languages: newLangs});
                }}
                placeholder="English"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
        </div>

        {/* Honors & Awards */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Honors & Awards</h2>
          <div className="space-y-4">
            {profile.awards.map((award, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  value={award.title}
                  onChange={(e) => {
                    const newAwards = [...profile.awards];
                    newAwards[index].title = e.target.value;
                    setProfile({...profile, awards: newAwards});
                  }}
                  placeholder="Client Champion Platinum"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={award.organization}
                    onChange={(e) => {
                      const newAwards = [...profile.awards];
                      newAwards[index].organization = e.target.value;
                      setProfile({...profile, awards: newAwards});
                    }}
                    placeholder="Martindale-Hubbell"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={award.year}
                    onChange={(e) => {
                      const newAwards = [...profile.awards];
                      newAwards[index].year = e.target.value;
                      setProfile({...profile, awards: newAwards});
                    }}
                    placeholder="2022"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Associations */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Professional Associations</h2>
          <div className="space-y-4">
            {profile.associations.map((assoc, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  value={assoc.name}
                  onChange={(e) => {
                    const newAssoc = [...profile.associations];
                    newAssoc[index].name = e.target.value;
                    setProfile({...profile, associations: newAssoc});
                  }}
                  placeholder="7th Judicial District Bar Association"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={assoc.role}
                    onChange={(e) => {
                      const newAssoc = [...profile.associations];
                      newAssoc[index].role = e.target.value;
                      setProfile({...profile, associations: newAssoc});
                    }}
                    placeholder="Member"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={assoc.duration}
                    onChange={(e) => {
                      const newAssoc = [...profile.associations];
                      newAssoc[index].duration = e.target.value;
                      setProfile({...profile, associations: newAssoc});
                    }}
                    placeholder="2017 - Present"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publications */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Publications</h2>
          <div className="space-y-4">
            {profile.publications.map((pub, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  value={pub.title}
                  onChange={(e) => {
                    const newPubs = [...profile.publications];
                    newPubs[index].title = e.target.value;
                    setProfile({...profile, publications: newPubs});
                  }}
                  placeholder="Feature Article"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={pub.publication}
                    onChange={(e) => {
                      const newPubs = [...profile.publications];
                      newPubs[index].publication = e.target.value;
                      setProfile({...profile, publications: newPubs});
                    }}
                    placeholder="Top 100 Attorneys Magazine"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={pub.year}
                    onChange={(e) => {
                      const newPubs = [...profile.publications];
                      newPubs[index].year = e.target.value;
                      setProfile({...profile, publications: newPubs});
                    }}
                    placeholder="2022"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Speaking Engagements */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Speaking Engagements</h2>
          <div className="space-y-4">
            {profile.speakingEngagements.map((speak, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  value={speak.title}
                  onChange={(e) => {
                    const newSpeak = [...profile.speakingEngagements];
                    newSpeak[index].title = e.target.value;
                    setProfile({...profile, speakingEngagements: newSpeak});
                  }}
                  placeholder="Stepparent Adoption in Colorado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={speak.event}
                    onChange={(e) => {
                      const newSpeak = [...profile.speakingEngagements];
                      newSpeak[index].event = e.target.value;
                      setProfile({...profile, speakingEngagements: newSpeak});
                    }}
                    placeholder="Legal Resource Day"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={speak.year}
                    onChange={(e) => {
                      const newSpeak = [...profile.speakingEngagements];
                      newSpeak[index].year = e.target.value;
                      setProfile({...profile, speakingEngagements: newSpeak});
                    }}
                    placeholder="2021"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attorney Endorsements */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Attorney Endorsements</h2>
          
          {/* Received Endorsements */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-[#181A2A] mb-3">Received Endorsements</h3>
            <div className="space-y-4">
              {profile.endorsements.received.map((endorsement, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={endorsement.initials}
                      onChange={(e) => {
                        const newEndorsements = {...profile.endorsements};
                        newEndorsements.received[index].initials = e.target.value;
                        setProfile({...profile, endorsements: newEndorsements});
                      }}
                      placeholder="MJ"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={endorsement.name}
                      onChange={(e) => {
                        const newEndorsements = {...profile.endorsements};
                        newEndorsements.received[index].name = e.target.value;
                        setProfile({...profile, endorsements: newEndorsements});
                      }}
                      placeholder="Myles Johnson"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={endorsement.title}
                      onChange={(e) => {
                        const newEndorsements = {...profile.endorsements};
                        newEndorsements.received[index].title = e.target.value;
                        setProfile({...profile, endorsements: newEndorsements});
                      }}
                      placeholder="Family Attorney"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={endorsement.date}
                      onChange={(e) => {
                        const newEndorsements = {...profile.endorsements};
                        newEndorsements.received[index].date = e.target.value;
                        setProfile({...profile, endorsements: newEndorsements});
                      }}
                      placeholder="Nov 27"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={endorsement.relationship}
                      onChange={(e) => {
                        const newEndorsements = {...profile.endorsements};
                        newEndorsements.received[index].relationship = e.target.value;
                        setProfile({...profile, endorsements: newEndorsements});
                      }}
                      placeholder="Opposing Counsel on matter"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    value={endorsement.endorsement}
                    onChange={(e) => {
                      const newEndorsements = {...profile.endorsements};
                      newEndorsements.received[index].endorsement = e.target.value;
                      setProfile({...profile, endorsements: newEndorsements});
                    }}
                    placeholder="Chris is a true professional. From my experience with Chris, he gets right to the meat of the issue and focuses on solutions rather than litigating the litigation unnecessarily. I endorse this lawyer."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Given Endorsements */}
          <div>
            <h3 className="text-md font-medium text-[#181A2A] mb-3">Given Endorsements</h3>
            <div className="space-y-4">
              {profile.endorsements.given.map((endorsement, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={endorsement.initials}
                      onChange={(e) => {
                        const newEndorsements = {...profile.endorsements};
                        newEndorsements.given[index].initials = e.target.value;
                        setProfile({...profile, endorsements: newEndorsements});
                      }}
                      placeholder="AB"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={endorsement.name}
                      onChange={(e) => {
                        const newEndorsements = {...profile.endorsements};
                        newEndorsements.given[index].name = e.target.value;
                        setProfile({...profile, endorsements: newEndorsements});
                      }}
                      placeholder="Attorney Name"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={endorsement.title}
                      onChange={(e) => {
                        const newEndorsements = {...profile.endorsements};
                        newEndorsements.given[index].title = e.target.value;
                        setProfile({...profile, endorsements: newEndorsements});
                      }}
                      placeholder="Criminal Defense Attorney"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={endorsement.date}
                      onChange={(e) => {
                        const newEndorsements = {...profile.endorsements};
                        newEndorsements.given[index].date = e.target.value;
                        setProfile({...profile, endorsements: newEndorsements});
                      }}
                      placeholder="Dec 15"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={endorsement.relationship}
                      onChange={(e) => {
                        const newEndorsements = {...profile.endorsements};
                        newEndorsements.given[index].relationship = e.target.value;
                        setProfile({...profile, endorsements: newEndorsements});
                      }}
                      placeholder="Colleague"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    value={endorsement.endorsement}
                    onChange={(e) => {
                      const newEndorsements = {...profile.endorsements};
                      newEndorsements.given[index].endorsement = e.target.value;
                      setProfile({...profile, endorsements: newEndorsements});
                    }}
                    placeholder="I endorse this attorney for their professionalism and expertise..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}