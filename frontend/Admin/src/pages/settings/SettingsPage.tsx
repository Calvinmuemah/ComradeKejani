import React, { useEffect, useState } from 'react';
import { User as UserIcon, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { fetchAdminProfile, updateAdminProfile, AdminProfile } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';
import { useToast } from '../../components/ui/Toast';

const SettingsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { notify } = useToast();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', avatar: '' });

  useEffect(()=>{
    const load = async () => {
      if(!user || !user.id){ setLoading(false); return; }
      try {
        const data = await fetchAdminProfile(user.id);
        setProfile(data);
        setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '', avatar: data.avatar || '' });
  } catch(err){
    const msg = err instanceof Error ? err.message : 'Failed to load profile';
    notify(msg,'error');
      } finally { setLoading(false); }
    };
    load();
  },[user, notify]);

  const startEdit = () => { if(profile){ setForm({ name: profile.name, email: profile.email, phone: profile.phone, avatar: profile.avatar || '' }); } setEditOpen(true); };
  const cancelEdit = () => { setEditOpen(false); };
  const handleChange = (k: string, v: string) => setForm(f=>({ ...f, [k]: v }));
  const submit = async () => {
    if(!profile) return; setUpdating(true);
    try {
  const updated = await updateAdminProfile(profile._id, form);
      setProfile(updated);
      notify('Profile updated','success');
      setEditOpen(false);
      if (refreshProfile) {
        refreshProfile();
      }
    } catch(err){
      const msg = err instanceof Error ? err.message : 'Update failed';
      notify(msg,'error');
    } finally { setUpdating(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Profile</h1>
        <p className="text-gray-400">Manage your account details</p>
      </div>
      <Card className="bg-oxford-900 border border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5"/> Profile</CardTitle>
          {!loading && profile && (
            <Button size="sm" variant="outline" onClick={startEdit}><Edit2 className="h-4 w-4 mr-1"/>Edit</Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-400 text-sm">Loading profile...</div>
          ) : profile ? (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-600/40 flex items-center justify-center overflow-hidden text-white text-xl font-semibold">
                  {profile.avatar ? (<img src={profile.avatar} alt="avatar" className="object-cover w-full h-full" />) : (profile.name?.[0] || 'A')}
                </div>
                <Badge variant="outline">User ID: {profile._id.slice(0,8)}…</Badge>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Name</p>
                  <p className="text-white font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Email</p>
                  <p className="text-white font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Phone</p>
                  <p className="text-white font-medium">{profile.phone}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Created</p>
                  <p className="text-white font-medium">{new Date(profile.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Last Updated</p>
                  <p className="text-white font-medium">{new Date(profile.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No profile found.</div>
          )}
        </CardContent>
      </Card>

      {editOpen && (
        <Card className="bg-oxford-900 border border-blue-800 ring-1 ring-blue-700/40">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="flex items-center gap-2"><Edit2 className="h-5 w-5"/> Edit Profile</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={cancelEdit} disabled={updating}><X className="h-4 w-4 mr-1"/>Cancel</Button>
              <Button size="sm" onClick={submit} disabled={updating}><Save className="h-4 w-4 mr-1"/>{updating? 'Saving...' : 'Save'}</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <Input value={form.name} onChange={e=>handleChange('name', e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <Input value={form.email} onChange={e=>handleChange('email', e.target.value)} placeholder="Email address" type="email" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone (+254XXXXXXXXX)</label>
                <Input value={form.phone} onChange={e=>handleChange('phone', e.target.value)} placeholder="+2547XXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Avatar URL</label>
                <div className="flex gap-2">
                  <Input value={form.avatar} onChange={e=>handleChange('avatar', e.target.value)} placeholder="https://..." />
                  {form.avatar && <div className="w-10 h-10 rounded bg-gray-800 overflow-hidden flex items-center justify-center">
                    <img src={form.avatar} alt="preview" className="object-cover w-full h-full" />
                  </div>}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={submit} disabled={updating}><Save className="h-4 w-4 mr-1"/>{updating? 'Saving...' : 'Save Changes'}</Button>
              <Button variant="outline" onClick={cancelEdit} disabled={updating}><X className="h-4 w-4 mr-1"/>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;