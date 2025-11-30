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
  Clock,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Shield,
  CreditCard,
  Bell,
  Camera
} from 'lucide-react';
import { BADGE_CONFIG } from '../../utils/constants';

// ReactBits
import CountUp from '../../components/reactbits/CountUp/CountUp';
import Aurora from '../../components/reactbits/Aurora/Aurora';
import SplitText from '../../components/reactbits/SplitText/SplitText';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { bookings, reviews } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

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
    <div className="min-h-screen bg-[#F2F5F9] p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1200px] bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-6 md:p-10 min-h-[85vh]">
        
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold text-gray-900">
              <SplitText text="My Profile" delay={50} />
           </h1>
        {!isEditing ? (
             <button 
               onClick={handleEdit}
               className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
             >
               <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
             <div className="flex gap-3">
               <button 
                 onClick={handleCancel}
                 className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all"
               >
                 <X className="w-4 h-4" /> Cancel
            </button>
               <button 
                 onClick={handleSave}
                 className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg"
               >
                 <Save className="w-4 h-4" /> Save
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-gray-900 text-white rounded-[32px] p-8 relative overflow-hidden min-h-[240px] flex items-center">
               <div className="absolute inset-0 opacity-40">
                  <Aurora colorStops={['#3B82F6', '#10B981', '#8B5CF6']} speed={0.5} />
               </div>
               
               <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 w-full">
                  <div className="relative group">
                     <div className="w-32 h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] flex items-center justify-center text-white text-5xl font-bold shadow-xl transform group-hover:scale-105 transition-transform">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                {isEditing && (
                       <button className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-700 transition-colors">
                          <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

                  <div className="flex-1 text-center md:text-left text-white">
                {!isEditing ? (
                  <>
                         <h2 className="text-4xl font-bold mb-2">{user?.username}</h2>
                         <p className="text-lg text-gray-300 mb-4">{user?.major || 'Major not set'}</p>
                         <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium text-white">
                               {user?.school || 'School'}
                      </span>
                            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium text-white">
                               Year {user?.yearOfStudy || 1}
                      </span>
                            <span className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/30">
                        {user?.role === 'tutor' ? 'Tutor' : 'Student'}
                      </span>
                    </div>
                  </>
                ) : (
                       <div className="space-y-4 w-full max-w-md">
                      <input
                        type="text"
                        value={editedUser.username || ''}
                        onChange={(e) => handleChange('username', e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Username"
                      />
                      <textarea
                        value={editedUser.bio || ''}
                        onChange={(e) => handleChange('bio', e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                            placeholder="Tell us a bit about yourself..."
                      />
                    </div>
                )}
              </div>
            </div>
          </div>

            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-white border border-gray-100 rounded-[24px] p-6 hover:shadow-lg hover:shadow-gray-100 transition-all group">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <User className="w-5 h-5 text-blue-500" /> 
                     </div>
                     Personal Info
                  </h3>
                  <div className="space-y-4">
              <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email</label>
                        {isEditing ? (
                  <input
                    type="email"
                    value={editedUser.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                             className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border-none text-sm"
                  />
                        ) : (
                           <div className="flex items-center gap-2 mt-1 text-gray-700">
                              <Mail className="w-4 h-4 text-gray-400" /> {user?.email}
                           </div>
                )}
              </div>
              <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Phone</label>
                        {isEditing ? (
                  <input
                    type="tel"
                    value={editedUser.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                             className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border-none text-sm"
                             placeholder="+65..."
                  />
                        ) : (
                           <div className="flex items-center gap-2 mt-1 text-gray-700">
                              <Phone className="w-4 h-4 text-gray-400" /> {user?.phone || 'Not Set'}
                           </div>
                )}
              </div>
            </div>
          </div>

               <div className="bg-white border border-gray-100 rounded-[24px] p-6 hover:shadow-lg hover:shadow-gray-100 transition-all group">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                        <GraduationCap className="w-5 h-5 text-purple-500" /> 
                     </div>
                     Academic Info
                  </h3>
                  <div className="space-y-4">
              <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">School</label>
                        {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.school || ''}
                    onChange={(e) => handleChange('school', e.target.value)}
                             className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border-none text-sm"
                  />
                        ) : (
                           <div className="mt-1 text-gray-700 font-medium">{user?.school}</div>
                )}
              </div>
              <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Major</label>
                        {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.major || ''}
                    onChange={(e) => handleChange('major', e.target.value)}
                             className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border-none text-sm"
                  />
                        ) : (
                           <div className="flex items-center gap-2 mt-1 text-gray-700">
                              <BookOpen className="w-4 h-4 text-gray-400" /> {user?.major}
              </div>
                        )}
                     </div>
              </div>
            </div>
          </div>

          {user?.role === 'tutor' && (
               <div className="bg-white border border-gray-100 rounded-[24px] p-6">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xl font-bold text-gray-900">Teaching Profile</h3>
                  {isEditing && (
                        <button onClick={addSubject} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                           <Plus className="w-4 h-4" /> Add Subject
                    </button>
                  )}
                </div>

                  <div className="space-y-6">
                     <div className="grid md:grid-cols-2 gap-4">
                        {(isEditing ? editedUser.subjects : user?.subjects)?.map((subject, idx) => (
                           <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group hover:border-gray-200 transition-colors">
                              {isEditing ? (
                                 <div className="space-y-2">
                            <input
                              value={subject.code}
                                       onChange={(e) => handleSubjectChange(idx, 'code', e.target.value)}
                                       className="w-full bg-white px-2 py-1 rounded border border-gray-200 text-sm font-bold"
                                       placeholder="Code"
                            />
                            <input
                                       value={subject.name} 
                                       onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                                       className="w-full bg-white px-2 py-1 rounded border border-gray-200 text-sm"
                                       placeholder="Name"
                            />
                                    <button onClick={() => removeSubject(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                              ) : (
                                 <>
                                    <div className="flex justify-between items-start">
                                       <span className="font-bold text-gray-900">{subject.code}</span>
                                       {subject.grade && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">Grade: {subject.grade}</span>}
                        </div>
                                    <p className="text-sm text-gray-600 mt-1">{subject.name}</p>
                                 </>
                      )}
                    </div>
                  ))}
              </div>

                     <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                  <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (Credits)</label>
                           {isEditing ? (
                      <input
                        type="number"
                        value={editedUser.hourlyRate || 10}
                                 onChange={(e) => handleChange('hourlyRate', e.target.value)}
                                 className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none"
                      />
                           ) : (
                              <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                 <CreditCard className="w-5 h-5 text-gray-400" /> 
                                 <CountUp to={user?.hourlyRate || 10} className="tabular-nums" />
                              </div>
                    )}
                  </div>
                  <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
                           {isEditing ? (
                              <input 
                                 type="text"
                                 value={editedUser.preferredLocations?.join(', ') || ''}
                                 onChange={(e) => handleChange('preferredLocations', e.target.value.split(',').map(s => s.trim()))}
                                 className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none"
                                 placeholder="Online, Library..."
                              />
                           ) : (
                      <div className="flex flex-wrap gap-2">
                                 {user?.preferredLocations?.map((loc, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600 flex items-center gap-1">
                                       <MapPin className="w-3 h-3" /> {loc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                  </div>
                </div>
            )}
                  </div>

          <div className="space-y-6">
             <div className="bg-gray-900 text-white rounded-[24px] p-6 shadow-xl shadow-gray-200">
                <h3 className="text-lg font-bold mb-6">Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                      <div className="text-3xl font-bold mb-1">
                         <CountUp to={user?.credits || 0} />
                </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Credits</div>
            </div>
                   <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                      <div className="text-3xl font-bold mb-1">
                         <CountUp to={completedSessions} />
          </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Sessions</div>
        </div>
                   <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm col-span-2 flex items-center justify-between">
                      <div>
                         <div className="text-3xl font-bold mb-1">
                            {averageRating}
              </div>
                         <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Rating</div>
              </div>
                      <div className="flex gap-1">
                         {[1,2,3,4,5].map((s) => (
                            <div key={s} className={`w-2 h-8 rounded-full ${s <= Math.round(averageRating) ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                         ))}
              </div>
              </div>
            </div>
          </div>

          {user?.badges && user.badges.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-[24px] p-6">
                   <h3 className="text-lg font-bold text-gray-900 mb-4">Badges</h3>
                   <div className="space-y-3">
                      {user.badges.map((badgeId, i) => {
                         const badge = BADGE_CONFIG[badgeId];
                  return (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all cursor-default">
                               <span className="text-2xl">{badge?.icon || '🏆'}</span>
                        <div>
                                  <div className="font-bold text-sm text-gray-900">{badge?.name || badgeId}</div>
                                  <div className="text-xs text-gray-500">{badge?.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

             <div className="bg-white border border-gray-100 rounded-[24px] p-2">
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                         <Shield className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-700">Security</span>
                   </div>
                   <span className="text-xs text-gray-400">Password & Auth</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                         <Bell className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-700">Notifications</span>
            </div>
                   <span className="text-xs text-gray-400">Email & Push</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
