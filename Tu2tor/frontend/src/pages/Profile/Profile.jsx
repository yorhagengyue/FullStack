import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  GraduationCap,
  Award,
  Star,
  Calendar,
  Clock,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Shield,
  CreditCard,
  Bell
} from 'lucide-react';
import { BADGE_CONFIG } from '../../utils/constants';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { bookings, reviews } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

  // Calculate stats
  const userBookings = bookings.filter(
    b => b.studentId === user?.userId || b.tutorId === user?.userId
  );
  const completedSessions = userBookings.filter(b => b.status === 'completed').length;
  const userReviews = reviews.filter(r => r.tutorId === user?.userId);
  const averageRating = userReviews.length > 0
    ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
    : 0;

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
  };

  const handleSave = () => {
    updateUser(editedUser);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...(editedUser.subjects || [])];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setEditedUser({ ...editedUser, subjects: newSubjects });
  };

  const addSubject = () => {
    const newSubjects = [...(editedUser.subjects || []), { code: '', name: '', grade: '' }];
    setEditedUser({ ...editedUser, subjects: newSubjects });
  };

  const removeSubject = (index) => {
    const newSubjects = editedUser.subjects.filter((_, i) => i !== index);
    setEditedUser({ ...editedUser, subjects: newSubjects });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>
        {!isEditing ? (
          <button onClick={handleEdit} className="btn-primary flex items-center">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-3">
            <button onClick={handleCancel} className="btn-secondary flex items-center">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {isEditing && (
                  <button className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Change Avatar
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                {!isEditing ? (
                  <>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{user?.username}</h2>
                    <p className="text-lg text-gray-600 mb-4">{user?.major}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {user?.school}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Year {user?.yearOfStudy}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {user?.role === 'tutor' ? 'Tutor' : 'Student'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={editedUser.username || ''}
                        onChange={(e) => handleChange('username', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={editedUser.bio || ''}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {!isEditing ? (
                  <div className="flex items-center text-gray-900">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {user?.email}
                  </div>
                ) : (
                  <input
                    type="email"
                    value={editedUser.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {!isEditing ? (
                  <div className="flex items-center text-gray-900">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {user?.phone || 'Not provided'}
                  </div>
                ) : (
                  <input
                    type="tel"
                    value={editedUser.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+65 XXXX XXXX"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Academic Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                {!isEditing ? (
                  <div className="flex items-center text-gray-900">
                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                    {user?.school}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editedUser.school || ''}
                    onChange={(e) => handleChange('school', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
                {!isEditing ? (
                  <div className="flex items-center text-gray-900">
                    <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                    {user?.major}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editedUser.major || ''}
                    onChange={(e) => handleChange('major', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                {!isEditing ? (
                  <div className="text-gray-900">Year {user?.yearOfStudy}</div>
                ) : (
                  <select
                    value={editedUser.yearOfStudy || 1}
                    onChange={(e) => handleChange('yearOfStudy', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Tutor Settings - Only show for tutors */}
          {user?.role === 'tutor' && (
            <>
              {/* Subjects */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Subjects I Teach</h3>
                  {isEditing && (
                    <button
                      onClick={addSubject}
                      className="flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Subject
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {(isEditing ? editedUser.subjects : user?.subjects)?.map((subject, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      {!isEditing ? (
                        <div>
                          <h4 className="font-semibold text-gray-900">{subject.code}</h4>
                          <p className="text-sm text-gray-600 mt-1">{subject.name}</p>
                          {subject.grade && (
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              Grade: {subject.grade}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={subject.code}
                              onChange={(e) => handleSubjectChange(index, 'code', e.target.value)}
                              placeholder="Course Code"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <input
                              type="text"
                              value={subject.grade || ''}
                              onChange={(e) => handleSubjectChange(index, 'grade', e.target.value)}
                              placeholder="Grade (e.g., A)"
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => removeSubject(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={subject.name}
                            onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                            placeholder="Course Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability & Rate */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tutoring Settings</h3>

                <div className="space-y-6">
                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate (Credits)
                    </label>
                    {!isEditing ? (
                      <div className="flex items-center text-gray-900">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                        {user?.hourlyRate || 10} credits per hour
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={editedUser.hourlyRate || 10}
                        onChange={(e) => handleChange('hourlyRate', parseInt(e.target.value))}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    )}
                  </div>

                  {/* Preferred Locations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Locations
                    </label>
                    {!isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        {user?.preferredLocations?.map((location, index) => (
                          <span key={index} className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                            <MapPin className="w-4 h-4 mr-2" />
                            {location}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={editedUser.preferredLocations?.join(', ') || ''}
                        onChange={(e) => handleChange('preferredLocations', e.target.value.split(',').map(s => s.trim()))}
                        placeholder="Enter locations separated by commas"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    )}
                  </div>

                  {/* Available Time Slots */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Time Slots
                    </label>
                    {!isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {user?.availableSlots?.map((slot, index) => (
                          <div key={index} className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            {slot}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={editedUser.availableSlots?.join(', ') || ''}
                        onChange={(e) => handleChange('availableSlots', e.target.value.split(',').map(s => s.trim()))}
                        placeholder="Enter time slots separated by commas (e.g., Mon 2-4pm, Wed 10-12pm)"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Account Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Account Settings</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-gray-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your password</p>
                  </div>
                </div>
              </button>

              <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-gray-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Notification Settings</p>
                    <p className="text-sm text-gray-500">Manage email and push notifications</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Achievements */}
        <div className="space-y-6">
          {/* Statistics Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="text-sm text-gray-600">Total Credits</span>
                </div>
                <span className="font-bold text-gray-900">{user?.credits || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-600">Sessions</span>
                </div>
                <span className="font-bold text-gray-900">{completedSessions}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm text-gray-600">Avg Rating</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-bold text-gray-900">{averageRating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-sm text-gray-600">Badges</span>
                </div>
                <span className="font-bold text-gray-900">{user?.badges?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          {user?.badges && user.badges.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {user.badges.map((badgeType, index) => {
                  const badge = BADGE_CONFIG[badgeType];
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 text-center hover:border-primary-300 transition-colors">
                      <div className="text-3xl mb-2">{badge?.icon}</div>
                      <p className="font-semibold text-gray-900 text-xs">{badge?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{badge?.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Profile Completion */}
          <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Profile Completion</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Complete your profile</span>
                <span className="font-bold">{user?.profileCompletion || 70}%</span>
              </div>
              <div className="bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${user?.profileCompletion || 70}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-white/80">
              Complete your profile to get more visibility and better matching with students!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
