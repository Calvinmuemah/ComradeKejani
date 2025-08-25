import React, { useEffect, useState, useRef } from 'react';
import { User as UserIcon, Edit2, CalendarClock, Image as ImageIcon } from 'lucide-react';
// (removed Card imports; timeline layout doesn't rely on Card component now)
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { fetchAdminProfile, updateAdminProfile, AdminProfile } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';
import { useToast } from '../../components/ui/Toast';

const SettingsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { notify } = useToast();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', avatar: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // staged file
  const [removeAvatar, setRemoveAvatar] = useState(false);
  // subtle internal flag to avoid overlapping silent refreshes
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  // track first mount to avoid replaying entrance animations on silent refresh
  const mountedRef = useRef(false);
  // preferences
  const [timezone, setTimezone] = useState<string>('UTC');
  const [locale, setLocale] = useState<string>('en-US');
  // support modal
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);

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
    if(!mountedRef.current) mountedRef.current = true;
    // load stored prefs
    try {
      const raw = localStorage.getItem('adminPrefs');
      if(raw){
        const parsed = JSON.parse(raw);
        if(parsed.timezone) setTimezone(parsed.timezone);
        if(parsed.locale) setLocale(parsed.locale);
      }
    } catch {/* ignore */}
  },[user, notify]);

  // Silent background auto-refresh (no UI indicator) every 45s
  useEffect(()=>{
    if(!user || !user.id) return;
    const id = setInterval(async () => {
      if(autoRefreshing) return; // prevent overlap
      setAutoRefreshing(true);
      try {
        const data = await fetchAdminProfile(user.id);
        setProfile(prev => {
          if(!prev) return data;
            // Only update if something changed (shallow important fields)
          if(prev.name === data.name && prev.email === data.email && prev.phone === data.phone && prev.avatar === data.avatar && prev.updatedAt === data.updatedAt) return prev;
          return data;
        });
      } catch { /* silent */ } finally { setAutoRefreshing(false); }
    }, 45000);
    return () => clearInterval(id);
  },[user, autoRefreshing]);

  // persist preferences
  useEffect(()=>{
    try { localStorage.setItem('adminPrefs', JSON.stringify({ timezone, locale })); } catch {/* ignore */}
  },[timezone, locale]);

  const formatDatePref = (iso: string | number | Date) => {
    try {
      const dt = new Date(iso);
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(dt);
    } catch { return String(iso); }
  };

  // support submit (placeholder: local only)
  const submitSupport = async () => {
    if(!supportSubject.trim() || !supportMessage.trim()) { notify('Fill subject & message','error'); return; }
    setSendingSupport(true);
    try {
      // if backend endpoint available, call here
      await new Promise(r=>setTimeout(r,600));
      notify('Support message sent','success');
      setShowSupportModal(false);
      setSupportSubject(''); setSupportMessage('');
    } catch { notify('Failed to send','error'); } finally { setSendingSupport(false); }
  };

  const openEdit = () => { if(profile){ setForm({ name: profile.name, email: profile.email, phone: profile.phone, avatar: profile.avatar || '' }); } setShowEditModal(true); };
  const closeEdit = () => { if(!saving) setShowEditModal(false); };
  const handleChange = (k: string, v: string) => setForm(f=>({ ...f, [k]: v }));
  const handleAvatarFile = (file?: File) => {
    if(!file) return; setAvatarFile(file); setRemoveAvatar(false);
    const previewUrl = URL.createObjectURL(file);
    setForm(f=>({ ...f, avatar: previewUrl }));
  };
  const handleDeleteAvatar = () => { setAvatarFile(null); setRemoveAvatar(true); setForm(f=>({ ...f, avatar: '' })); };
  const submit = async () => {
    if(!profile) return; setSaving(true);
    try {
  const updated = await updateAdminProfile(profile._id, { name: form.name, email: form.email, phone: form.phone, avatar: form.avatar && !avatarFile ? form.avatar : undefined, avatarFile: avatarFile || null, removeAvatar, updatedAtVersion: profile.updatedAt ? new Date(profile.updatedAt).getTime() : undefined });
      setProfile(updated);
      notify('Profile updated','success');
      if (refreshProfile) refreshProfile();
      setShowEditModal(false);
      setAvatarFile(null); setRemoveAvatar(false);
    } catch(err){
      notify(err instanceof Error ? err.message : 'Update failed','error');
    } finally { setSaving(false); }
  };

  // Timeline node helper
  // Tree style hierarchy components
  interface TreeParentProps { icon: React.ReactNode; label: string; last?: boolean; children: React.ReactNode }
  const TreeParent: React.FC<TreeParentProps> = ({ icon, label, last, children }) => (
    <div className="relative pl-10 pt-4 animate-fade-in" style={{ animationDuration: '0.6s' }}>
      {/* vertical spine for siblings with gradient */}
      <div className={`pointer-events-none absolute left-4 top-0 ${last ? 'h-8' : 'h-full'} w-px bg-gradient-to-b from-blue-600/20 via-cyan-400/25 to-transparent`} />
      {/* parent node */}
      <div className="relative flex items-start gap-4">
        <div className="relative flex-shrink-0 group/node">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#14324f] via-[#11283f] to-[#0c1e31] border border-blue-500/30 flex items-center justify-center text-cyan-200 text-[14px] shadow-[0_0_10px_-2px_rgba(56,189,248,0.3)] transition-all duration-500 group-hover/node:scale-105 group-hover/node:shadow-[0_0_14px_-2px_rgba(56,189,248,0.55)]">
            {icon}
          </div>
          {/* connector to children with soft glow */}
          <div className="absolute left-1/2 top-8 -translate-x-1/2 w-px bg-gradient-to-b from-cyan-400/30 via-blue-500/20 to-transparent" style={{ height: 'calc(100% - 2rem)' }} />
        </div>
        <div className="flex-1">
          <div className="mb-3 pb-1 border-b border-gray-800/70 flex items-center gap-2">
            <p className="text-[13px] uppercase tracking-[0.18em] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-300 drop-shadow-sm">{label}</p>
            <span className="h-1 w-1 rounded-full bg-cyan-400/60 animate-pulse" />
          </div>
          <div className="relative pl-4">
            {/* child vertical line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400/25 via-gray-600/40 to-transparent" />
            <div className="space-y-2.5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TreeLeaf: React.FC<{ label: string; value?: React.ReactNode; image?: boolean; last?: boolean }> = ({ label, value, image, last }) => (
    <div className="relative pl-8 group/leaf">
      {/* horizontal connector */}
      <div className="absolute left-0 top-5 w-6 h-px bg-gradient-to-r from-blue-500/30 via-cyan-400/40 to-transparent" />
      {/* mask vertical tail if last */}
      {last && <div className="absolute left-[1px] top-5 bottom-0 w-px bg-gradient-to-b from-transparent via-transparent to-[#0d1829]" />}
      <div className={`inline-flex ${image ? 'flex-col gap-3 items-start' : 'items-center gap-4'} rounded-lg px-3 py-2.5 bg-gradient-to-br from-[#0f2236]/40 to-[#0b1929]/30 border border-gray-700/60 hover:border-cyan-500/50 transition-shadow duration-400 shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_8px_0_rgba(34,211,238,0.25)] backdrop-blur-sm`}>
        <span className="text-[12px] font-semibold tracking-wide text-cyan-200/90 group-hover/leaf:text-cyan-100 transition-colors">{label}</span>
        {image ? (
          <div className="w-40 h-40 rounded-2xl ring-2 ring-cyan-500/30 overflow-hidden flex items-center justify-center bg-[#142338] text-white text-4xl font-semibold relative shadow-inner shadow-cyan-500/10 animate-fade-in" style={{ animationDuration: '0.8s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 pointer-events-none" />
            <div className="transition-transform duration-[1200ms] ease-out group-hover/leaf:scale-105 group-hover/leaf:rotate-[1.5deg]">
              {value}
            </div>
          </div>
        ) : (
          <span className="text-base leading-snug font-medium text-gray-200 break-all group-hover/leaf:text-white transition-colors">{value || '—'}</span>
        )}
      </div>
    </div>
  );

  return (
  <div className="space-y-10 w-full -mx-6 px-6 pt-2 pb-16 bg-transparent min-h-[calc(100vh-6rem)]">
      {/* Header */}
  <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-[#0d1829] border border-gray-800/80 rounded-2xl p-6 shadow-inner shadow-black/40">
        {/* animated flowing background layer */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen" style={{background:'radial-gradient(circle at 20% 35%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(circle at 85% 70%, rgba(14,165,233,0.15), transparent 55%)', animation:'pulseClouds 18s linear infinite'}} />
        <div className="space-y-3 relative">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(110deg,#8be9ff_0%,#c4f1ff_35%,#72d8ff_60%,#8be9ff_100%)] bg-[length:200%_100%] animate-[gradientMove_12s_ease_infinite] flex items-center gap-2 drop-shadow-[0_2px_6px_rgba(56,189,248,0.25)]">
            <UserIcon className={`h-8 w-8 text-cyan-300 ${!mountedRef.current ? 'animate-[popIn_0.6s_ease]' : ''}`}/> Profile
          </h1>
          <p className={`text-[15px] leading-snug text-cyan-100/80 font-medium ${!mountedRef.current ? 'animate-[fadeInUp_0.8s_ease]' : ''}`}>Manage your administrative identity & credentials.</p>
          {profile && (
            <Badge variant="outline" className={`border-cyan-400/40 text-cyan-200 bg-cyan-500/10 backdrop-blur-sm ${!mountedRef.current ? 'animate-[fadeInUp_1s_ease]' : ''}`}>
              ID: {profile._id.slice(0,10)}…
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center relative">
          <Button size="sm" className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:brightness-110 text-white border border-cyan-400/50 shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_12px_-2px_rgba(56,189,248,0.55)] transition-all" onClick={openEdit} disabled={loading || !profile}><Edit2 className="h-4 w-4 mr-1"/>Edit</Button>
        </div>
        {/* keyframe styles */}
        <style>{`@keyframes gradientMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}@keyframes pulseClouds{0%{transform:translateY(0)}50%{transform:translateY(8px)}100%{transform:translateY(0)}}@keyframes fadeInUp{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}@keyframes popIn{0%{opacity:0;transform:scale(.6) rotate(-8deg)}60%{opacity:1;transform:scale(1.08) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}`}</style>
      </div>

      {/* Avatar Node + Info Nodes */}
      {loading ? (
        <div className="text-gray-400 text-sm">Loading profile...</div>
      ) : profile ? (
        <div className="relative">
          {/* master vertical line (faint) */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-700/30 to-transparent" />
          {/* Hierarchical tree */}
          <div className="relative mt-2 grid grid-cols-1 xl:grid-cols-3 gap-12">
            {/* Preferences column */}
            <div className="xl:col-span-1 relative">
              <div className="absolute left-4 top-0 bottom-0 border-l border-gray-700/40" />
              <TreeParent icon={<span className="text-xs">⏱️</span>} label="Preferences">
                <TreeLeaf label="Timezone" value={
                  <select value={timezone} onChange={e=>setTimezone(e.target.value)} className="bg-[#0b1929] border border-gray-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 text-gray-200">
                    {['UTC','Africa/Nairobi','Africa/Johannesburg','Europe/London','Europe/Berlin','America/New_York','Asia/Tokyo'].map(t=> <option key={t} value={t}>{t}</option>)}
                  </select>
                } />
                <TreeLeaf label="Locale" value={
                  <select value={locale} onChange={e=>setLocale(e.target.value)} className="bg-[#0b1929] border border-gray-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 text-gray-200">
                    {['en-US','en-GB','fr-FR','de-DE','sw-KE','es-ES'].map(l=> <option key={l} value={l}>{l}</option>)}
                  </select>
                } last />
              </TreeParent>
            </div>
            {/* Support column */}
            <div className="xl:col-span-1 relative">
              <div className="absolute left-4 top-0 bottom-0 border-l border-gray-700/40" />
              <TreeParent icon={<span className="text-xs">🛠️</span>} label="Support">
                <TreeLeaf label="Documentation" value={<a href="https://docs.example.com" target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Open Docs ↗</a>} />
                <TreeLeaf label="Report Issue" value={<a href="/reports" className="text-cyan-300 hover:underline">Go to Reports</a>} />
                <TreeLeaf label="Contact Support" value={<Button size="sm" className="bg-cyan-600/80 hover:bg-cyan-600 text-white border border-cyan-400/50" onClick={()=>setShowSupportModal(true)}>Open Form</Button>} last />
              </TreeParent>
            </div>
            {/* Column guides */}
            <div className="xl:col-span-1 relative">
              <div className="absolute left-4 top-0 bottom-0 border-l border-gray-700/40" />
              <TreeParent icon={<ImageIcon className="h-4 w-4" />} label="Avatar">
                <TreeLeaf label="Current" image value={profile.avatar ? <img src={profile.avatar} alt="avatar" className="object-cover w-full h-full" /> : (profile.name?.[0] || 'A')} />
              </TreeParent>
            </div>
            <div className="xl:col-span-1 relative">
              <div className="absolute left-4 top-0 bottom-0 border-l border-gray-700/40" />
              <TreeParent icon={<UserIcon className="h-4 w-4" />} label="Identity">
                <TreeLeaf label="Name" value={profile.name || '—'} />
                <TreeLeaf label="Email" value={profile.email || '—'} />
                <TreeLeaf label="Phone" value={profile.phone || '—'} last />
              </TreeParent>
            </div>
            <div className="xl:col-span-1 relative">
              <div className="absolute left-4 top-0 bottom-0 border-l border-gray-700/40" />
              <TreeParent icon={<CalendarClock className="h-4 w-4" />} label="Dates" last>
                <TreeLeaf label="Created" value={formatDatePref(profile.createdAt)} />
                <TreeLeaf label="Updated" value={formatDatePref(profile.updatedAt)} last />
              </TreeParent>
            </div>
          </div>
        </div>
      ) : (<div className="text-gray-400 text-sm">No profile found.</div>)}

      {/* Edit Profile Modal (replicates Listings Edit modal timeline style) */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEdit}
        title={saving ? 'Saving Profile…' : 'Edit Profile'}
        tone="info"
        className="border border-gray-800 max-w-6xl w-full"
      >
        <div className="space-y-12 pr-1">{/* mirror listings modal spacing */}
          {/* Section: Basics */}
          <section className="relative pl-5" data-edit-section="profile-basics">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" />
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Basics <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 1</span></h3>
              <p className="text-xs text-gray-400">Update your core profile information. Leave a field blank to keep existing value.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <Input value={form.name} onChange={e=>handleChange('name', e.target.value)} className="bg-oxford-900 border-gray-800" placeholder={profile?.name || 'Full name'} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <Input type="email" value={form.email} onChange={e=>handleChange('email', e.target.value)} className="bg-oxford-900 border-gray-800" placeholder={profile?.email || 'email@example.com'} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone (+254XXXXXXXXX)</label>
                <Input value={form.phone} onChange={e=>handleChange('phone', e.target.value)} className="bg-oxford-900 border-gray-800" placeholder={profile?.phone || '+2547XXXXXXXX'} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Manual Avatar URL (optional)</label>
                <Input value={form.avatar} onChange={e=>handleChange('avatar', e.target.value)} className="bg-oxford-900 border-gray-800" placeholder="https://..." />
                {form.avatar && (
                  <div className="mt-2 w-20 h-20 rounded-lg bg-oxford-900/40 border border-gray-800 overflow-hidden">
                    <img src={form.avatar} alt="preview" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section: Avatar (Upload) */}
          <section className="relative pl-5" data-edit-section="profile-avatar">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 border border-fuchsia-400/30 shadow-[0_0_0_2px_rgba(192,38,211,0.35)]" />
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Avatar <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 2</span></h3>
              <p className="text-xs text-gray-400">Choose an image or provide a manual URL. Nothing uploads until you click Save.</p>
            </header>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <div className="w-36 h-36 rounded-xl bg-gradient-to-br from-oxford-900 to-oxford-950 border border-gray-800 flex items-center justify-center overflow-hidden mb-3 shadow-inner relative">
                  { (form.avatar || profile?.avatar) ? (
                    <img src={form.avatar || profile?.avatar || ''} alt="Avatar" className="w-full h-full object-cover" />
                  ) : <span className="text-[10px] text-gray-500">No Avatar</span> }
                </div>
                <label className="cursor-pointer bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-medium py-2 px-4 rounded-md transition duration-200 shadow relative overflow-hidden">
                  <span className="relative z-10">Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e=>handleAvatarFile(e.target.files?.[0])}
                    disabled={saving}
                  />
                </label>
                {(profile?.avatar || form.avatar) && (
                  <Button
                    size="sm"
                    onClick={handleDeleteAvatar}
                    disabled={saving}
                    className="mt-3 bg-rose-600/80 hover:bg-rose-600 text-white border border-rose-500/60"
                  >
                    {removeAvatar ? 'Removed' : 'Remove'}
                  </Button>
                )}
                <p className="mt-2 text-[10px] text-gray-500 max-w-[10rem] text-center md:text-left">Avatar is staged. It uploads when you click Save.</p>
              </div>
              <div className="flex-1 text-xs text-gray-400 space-y-2">
                <p className="text-gray-300 font-medium">Guidelines</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Square images look best (1:1)</li>
                  <li>Use high contrast for readability</li>
                  <li>Keep under 2MB for faster load</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section: Save */}
          <section className="relative pl-5 pb-4" data-edit-section="profile-save">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 border border-amber-400/30 shadow-[0_0_0_2px_rgba(245,158,11,0.35)]" />
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Finalize <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 3</span></h3>
              <p className="text-xs text-gray-400">Review your changes then save. Blank fields are ignored.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-xs text-gray-400 bg-oxford-900/40 border border-gray-800 rounded-lg p-4">
                <p className="text-gray-300 font-medium mb-2">Quick Tips</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Avatar changes apply on Save</li>
                  <li>Manual URL overrides uploaded image</li>
                  <li>Leave a field blank to keep current value</li>
                </ul>
              </div>
              <div className="text-xs text-gray-400 bg-oxford-900/40 border border-gray-800 rounded-lg p-4">
                <p className="text-gray-300 font-medium mb-2">Current Snapshot</p>
                <ul className="space-y-1">
                  <li><span className="text-gray-500">Name:</span> <span className="text-gray-300">{profile?.name}</span></li>
                  <li><span className="text-gray-500">Email:</span> <span className="text-gray-300">{profile?.email}</span></li>
                  <li><span className="text-gray-500">Phone:</span> <span className="text-gray-300">{profile?.phone}</span></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 justify-end">
              <Button disabled={saving} onClick={closeEdit} className="bg-gray-700/40 hover:bg-gray-600/60 text-gray-200 border border-gray-600/60">Cancel</Button>
              <Button disabled={saving} onClick={submit} className="bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save Changes'}</Button>
            </div>
          </section>
        </div>
      </Modal>
      {/* Support Modal */}
      <Modal isOpen={showSupportModal} onClose={()=> !sendingSupport && setShowSupportModal(false)} title={sendingSupport ? 'Sending…' : 'Contact Support'} tone="info" className="border border-gray-800 max-w-xl w-full">
        <div className="space-y-6">
          <div className="grid gap-4">
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-400">Subject</label>
              <input value={supportSubject} onChange={e=>setSupportSubject(e.target.value)} className="mt-1 w-full bg-[#0b1929] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Short summary" />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-400">Message</label>
              <textarea value={supportMessage} onChange={e=>setSupportMessage(e.target.value)} rows={5} className="mt-1 w-full bg-[#0b1929] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-y" placeholder="Describe your issue or question" />
              <p className="mt-1 text-[10px] text-gray-500">We aim to respond within 24 hours.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" disabled={sendingSupport} onClick={()=>setShowSupportModal(false)} className="border border-gray-700 text-gray-300 hover:bg-gray-700/40">Cancel</Button>
            <Button disabled={sendingSupport} onClick={submitSupport} className="bg-cyan-600/80 hover:bg-cyan-600 text-white disabled:opacity-60">{sendingSupport ? 'Sending…' : 'Send Message'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;