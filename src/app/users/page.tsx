'use client';

import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { UserRole, BranchId, UserProfile } from '../../lib/types';
import { ManagerPinModal } from '../../components/auth/ManagerPinModal';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  KeyRound, 
  Building2, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  Edit3, 
  UserPlus, 
  ShieldAlert,
  Search
} from 'lucide-react';

export default function UsersPage() {
  const { userProfiles, activeUser, branches, addUserProfile, updateUserProfile } = usePharmacy();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  // Add User Form Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPinCode, setNewPinCode] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('CASHIER');
  const [newBranchId, setNewBranchId] = useState<BranchId>('ACCRA_MAIN');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Manager Elevation for Cashier trying to perform admin actions
  const [isManagerAuthorized, setIsManagerAuthorized] = useState(activeUser.role !== 'CASHIER');
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);

  // Edit PIN Modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editPin, setEditPin] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('CASHIER');

  const isOwner = activeUser.role === 'OWNER';

  const togglePinVisibility = (id: string) => {
    if (!isManagerAuthorized) {
      setIsManagerModalOpen(true);
      return;
    }
    setShowPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newFullName || !newEmail || !newPinCode) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (newPinCode.length !== 4 || !/^\d{4}$/.test(newPinCode)) {
      setFormError('PIN code must be exactly 4 digits.');
      return;
    }

    try {
      await addUserProfile({
        fullName: newFullName,
        email: newEmail,
        pinCode: newPinCode,
        role: newRole,
        branchId: newBranchId,
        isActive: true,
      });

      setFormSuccess(`User profile created for ${newFullName}`);
      setNewFullName('');
      setNewEmail('');
      setNewPinCode('');
      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormSuccess('');
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user profile');
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editPin && (editPin.length !== 4 || !/^\d{4}$/.test(editPin))) {
      alert('PIN must be exactly 4 digits');
      return;
    }

    await updateUserProfile(editingUser.id, {
      role: editRole,
      ...(editPin ? { pinCode: editPin } : {}),
    });

    setEditingUser(null);
    setEditPin('');
  };

  const filteredUsers = userProfiles.filter(u => {
    const q = searchTerm.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 text-slate-900 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100/60 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center space-x-3">
          <div className="bg-[#4E60FF] p-3 rounded-xl text-white shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">User Management & Counter PINs</h1>
            <p className="text-xs text-slate-500 font-medium">Manage employee roles, access permissions, and 4-digit counter unlocking PIN codes</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (!isManagerAuthorized) {
              setIsManagerModalOpen(true);
            } else {
              setIsAddModalOpen(true);
            }
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#4E60FF] hover:bg-[#3D4FE6] text-white font-medium text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff Account</span>
        </button>
      </div>

      {/* Cashier Restricted Elevation Notice Banner */}
      {activeUser.role === 'CASHIER' && !isManagerAuthorized && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3 text-amber-800 text-xs">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-bold">Manager Approval Required for Full Access</p>
              <p className="text-[11px] text-amber-700">You are logged in as Cashier. Unlocking PINs or adding staff requires Manager authorization.</p>
            </div>
          </div>
          <button
            onClick={() => setIsManagerModalOpen(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Authorize Manager PIN
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Registered Staff: <span className="font-bold text-slate-900">{userProfiles.length}</span>
        </div>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-white border border-slate-100/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="text-slate-400 font-medium uppercase tracking-wider py-3 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Assigned Branch</th>
                <th className="py-3 px-3 text-center">4-Digit PIN</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => {
                const isPinVisible = showPins[u.id];
                const branchName = branches.find(b => b.id === u.branchId)?.name || u.branchId;

                const roleBadge = 
                  u.role === 'OWNER' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                  u.role === 'BRANCH_MANAGER' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-[#4E60FF]/10 text-[#4E60FF] font-black flex items-center justify-center border border-[#4E60FF]/20">
                          {u.fullName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{u.fullName}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${roleBadge}`}>
                        {u.role === 'BRANCH_MANAGER' ? 'BRANCH MANAGER' : u.role}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-slate-600 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#4E60FF]" />
                        <span>{branchName}</span>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-center font-mono">
                      <div className="inline-flex items-center space-x-1.5 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                        <span className="font-bold tracking-widest text-slate-900 text-xs">
                          {isPinVisible ? u.pinCode : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(u.id)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                          title="Toggle PIN Visibility"
                        >
                          {isPinVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                        <span>{u.isActive ? 'Active' : 'Disabled'}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            if (!isManagerAuthorized) {
                              setIsManagerModalOpen(true);
                            } else {
                              setEditingUser(u);
                              setEditRole(u.role);
                              setEditPin(u.pinCode);
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#4E60FF]" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (!isManagerAuthorized) {
                              setIsManagerModalOpen(true);
                              return;
                            }
                            await updateUserProfile(u.id, { isActive: !u.isActive });
                          }}
                          className={`px-2.5 py-1 font-medium rounded-lg text-xs cursor-pointer ${
                            u.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Staff Member */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#4E60FF]/10 text-[#4E60FF] rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Add Staff Account</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ama Serwaa"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F4F7] border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ama.serwaa@pharmasync.gh"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F4F7] border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">4-Digit Counter PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="1234"
                    value={newPinCode}
                    onChange={(e) => setNewPinCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-[#F3F4F7] border border-slate-200 rounded-xl text-center font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Staff Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-[#F3F4F7] border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]"
                  >
                    <option value="CASHIER">CASHIER</option>
                    <option value="BRANCH_MANAGER">BRANCH MANAGER</option>
                    <option value="OWNER">OWNER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch Location</label>
                <select
                  value={newBranchId}
                  onChange={(e) => setNewBranchId(e.target.value as BranchId)}
                  className="w-full px-3 py-2 bg-[#F3F4F7] border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">{formError}</p>
              )}

              {formSuccess && (
                <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">{formSuccess}</p>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4E60FF] hover:bg-[#3D4FE6] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Staff Member */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-sm w-full p-6 text-slate-900 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Edit {editingUser.fullName}</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-[#F3F4F7] border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]"
                >
                  <option value="CASHIER">CASHIER</option>
                  <option value="BRANCH_MANAGER">BRANCH MANAGER</option>
                  <option value="OWNER">OWNER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter new 4-digit PIN"
                  className="w-full px-3 py-2 bg-[#F3F4F7] border border-slate-200 rounded-xl text-center font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4E60FF]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4E60FF] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manager PIN Elevation Modal */}
      <ManagerPinModal
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
        onSuccess={() => setIsManagerAuthorized(true)}
        title="Manager PIN Authorization"
        description="Enter a Manager or Owner PIN to grant access to user management and PIN viewing."
      />

    </div>
  );
}
