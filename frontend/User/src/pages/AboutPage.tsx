import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/useTheme';
import { Shield, Users, Map, Home, Sparkles, Mail, Phone, Globe, MapPin, Calendar, HeartHandshake, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ObserverRevealProps { children: React.ReactNode; className?: string; threshold?: number; animation?: string; }
const ObserverReveal: React.FC<ObserverRevealProps> = ({ children, className = '', threshold = 0.15, animation = 'animate-fadeInUp' }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return <div ref={ref} className={`${className} transition-all duration-700 ${visible ? `${animation} opacity-100 translate-y-0` : 'opacity-0 translate-y-6'}`}>{children}</div>;
};

// Inject keyframes once (gradient + custom animations)
const useAboutAnimations = () => {
  useEffect(() => {
    const id = 'about-animations';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `@keyframes gradientFlow {0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}@keyframes floatPulse {0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}@keyframes fadeInUp {0%{opacity:0;transform:translateY(24px);}100%{opacity:1;transform:translateY(0);}}.animate-fadeInUp{animation:fadeInUp 0.8s cubic-bezier(.16,.8,.3,1) forwards}`;
    document.head.appendChild(style);
  }, []);
};

export const AboutPage: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  useAboutAnimations();

  const features = [
    { icon: Home, title: 'Smart Discovery', desc: 'Advanced filters + AI ranking to surface relevant housing faster.' },
    { icon: Map, title: 'Contextual Maps', desc: 'Distance, clusters & nearby essentials in one visual layer.' },
    { icon: Shield, title: 'Safety Signals', desc: 'Community reports & notices improve transparency & trust.' },
    { icon: Users, title: 'Peer Community', desc: 'Student reviews & discussions guide better decisions.' },
    { icon: Sparkles, title: 'AI Assist', desc: 'Personal recommendations adapt to your evolving preferences.' }
  ];

  const coreValues = [
    { icon: Shield, label: 'Trust & Security', desc: 'Verified data & safer discovery journeys.' },
    { icon: Sparkles, label: 'Innovation', desc: 'Iterating with meaningful, student‑centric features.' },
    { icon: Users, label: 'Accessibility', desc: 'Inclusive design & performance focus.' },
    { icon: HeartHandshake, label: 'Community Support', desc: 'Collective insight powering better housing choices.' }
  ];

  // Team data unified card layout – each card styled like Project Manager's
  const team = [
    {
      name: 'Abraham Khoome',
      title: 'Project Manager',
      highlight: true,
      bio: 'He turned an idea into a real product by guiding the team every step of the way.',
      contributions: [
        'Led the project from idea to completion.',
        'Aligned development with vision & mission.',
        'Coordinated teamwork across roles.',
        'Ensured milestones were met with quality.'
      ],
      linkedin: '#',
      email: 'mailto:abraham@example.com',
      img: '/abraham-khoome.png'
    },
    {
      name: 'John Nyamweya',
      title: 'Lead Developer & DevOps Engineer',
      bio: 'He made the system both beautiful and functional while keeping it running seamlessly.',
      contributions: [
        'Built the responsive user interface.',
        'Integrated frontend with backend services.',
        'Set up & managed deployment pipelines & infra.',
        'Maintained code quality & guided technical choices.'
      ],
      github: 'https://github.com/ByteCraft404',
      linkedin: '#',
  portfolio: 'https://johnnyamweya.onrender.com/',
      img: '/john-nyamweya.jpg'
    },
    {
      name: 'Kelvin Muemah',
      title: 'Backend Engineer & System Designer',
      bio: 'He built the engine and laid the blueprint for how the system works behind the scenes.',
      contributions: [
        'Designed full system architecture & workflows.',
        'Developed & optimized backend APIs.',
        'Secured & tuned performance for real use.',
        'Structured the database for scalability.'
      ],
      github: 'https://github.com/Calvinmuemah',
      linkedin: '#',
      img: '/kelvin-muemah.jpg'
    },
    {
      name: 'Willington Juma',
      title: 'Collaborator',
      bio: 'They influenced the vision and direction of the project.',
      contributions: [
        'Contributed early brainstorming ideas.',
        'Helped validate concept via research.',
        'Shared insights shaping features & flow.'
      ],
      github: 'https://github.com/samrato',
      linkedin: '#',
      img: '/willington-juma.jpg'
    },
    {
      name: 'Derrick',
      title: 'Collaborator',
      bio: 'They influenced the vision and direction of the project.',
      contributions: [
        'Contributed early brainstorming ideas.',
        'Helped validate concept via research.',
        'Shared insights shaping features & flow.'
      ],
  github: 'https://github.com/derycks043',
      linkedin: '#',
      img: '/derrick.png'
    }
  // To use real images: place files in public folder with the exact path set in each member's img.
  // Recommended naming: lowercase, hyphenated: abraham-khoome.png, john-nyamweya.png, kelvin-muemah.png, willington-juma.png, derrick.png
  // Then remove or adjust any onError fallback if desired.
  ];

  return (
    <div className={`w-full min-h-screen ${isLight ? 'bg-white' : 'bg-oxford-900'} text-foreground`}> 
      {/* Hero (simplified) */}
      <section className="w-full py-24 md:py-32 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(circle_at_30%_30%,#3b82f680,transparent_60%),radial-gradient(circle_at_70%_70%,#8b5cf680,transparent_60%)]" />
        </div>
        <ObserverReveal>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-sky-400 to-purple-500">
            Built for Students. Powered by Trust.
          </h1>
        </ObserverReveal>
        <ObserverReveal className="max-w-2xl mx-auto mt-6">
          <p className={`text-base md:text-lg leading-relaxed ${isLight ? 'text-gray-600' : 'text-blue-100/90'}`}>
            A focused housing platform helping students discover safer, verified and community‑endorsed spaces faster.
          </p>
        </ObserverReveal>
        <ObserverReveal className="mt-10">
          <button onClick={() => document.getElementById('about-system')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors">
            Learn More <span>↓</span>
          </button>
        </ObserverReveal>
      </section>

      {/* About the System */}
      <section id="about-system" className="px-6 md:px-12 py-16 space-y-12">
        <ObserverReveal className="max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Built</h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Our platform streamlines student housing: surfacing verified listings, safety context, map intelligence and authentic peer feedback. We remove friction in choosing accommodation by combining structured data, community insight and adaptive AI suggestions.
          </p>
        </ObserverReveal>
        <ObserverReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full">
          {features.map(f => (
            <div key={f.title} className={`group relative rounded-xl border p-6 flex flex-col gap-3 overflow-hidden transition-all ${isLight ? 'bg-white border-gray-200 hover:shadow-md' : 'bg-oxford-900 border-primary/20 hover:border-primary/40'} hover:-translate-y-1`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
              <div className="flex items-center gap-3">
                <f.icon className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">{f.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </ObserverReveal>
      </section>

      {/* Vision & Mission */}
      <section className="px-6 md:px-12 py-12 grid gap-8 md:grid-cols-2">
        <ObserverReveal className={`rounded-2xl border p-8 relative overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-oxford-900 border-primary/25'}`}>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><Sparkles className="w-6 h-6 text-primary" /> Vision</h3>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">To become the leading student housing platform in Africa—ensuring every student can access safe, transparent and affordable accommodation choices.</p>
        </ObserverReveal>
        <ObserverReveal className={`rounded-2xl border p-8 relative overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-oxford-900 border-primary/25'}`} animation="animate-fadeInUp">
          <div className="absolute -bottom-24 -left-16 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl" />
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><Shield className="w-6 h-6 text-primary" /> Mission</h3>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">We connect students to verified homes by providing reliable listings, contextual safety data, peer knowledge & effortless discovery tools.</p>
        </ObserverReveal>
      </section>

      {/* Core Values */}
      <section className="px-6 md:px-12 py-12">
        <ObserverReveal className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Core Values</h2>
          <p className="text-muted-foreground max-w-2xl">Principles that drive our decisions & roadmap.</p>
        </ObserverReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map(v => (
            <ObserverReveal key={v.label} className={`group relative p-6 rounded-xl border transition-all ${isLight ? 'bg-white border-gray-200' : 'bg-oxford-900 border-primary/20'} hover:-translate-y-1 hover:border-primary/40`}>
              <div className="flex items-start gap-4">
                <v.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{v.label}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </div>
            </ObserverReveal>
          ))}
        </div>
      </section>

      {/* Team (Expanded) */}
      <section className="px-6 md:px-12 py-20 relative">
        {/* Plain container (removed border & background) */}
        <div className="relative">
          <ObserverReveal className="mb-10 text-center max-w-3xl mx-auto relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet The Team</h2>
            <p className="text-muted-foreground">Behind the code and design is a passionate team dedicated to solving student housing challenges.</p>
          </ObserverReveal>
          {/* Network Layout */}
          <div className="relative z-10 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-10 md:gap-0 max-w-6xl mx-auto">
              {/* Row 1: Project Manager centered */}
              <div className="hidden md:block" />
              <div className="hidden md:block" />
              <div className="hidden md:block" />
              <div className="md:col-span-1 flex justify-center md:justify-center" >
                {team.filter(t=>t.highlight).map((m)=> (
                  <div key={m.name} className="relative group">
                    <div className={`relative rounded-2xl border p-6 w-72 flex flex-col text-center overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-oxford-900/70 border-primary/30'} shadow-sm hover:shadow-lg transition-all hover:-translate-y-1`}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(at_50%_50%,rgba(59,130,246,0.25),transparent_35%,rgba(59,130,246,0.25))] pointer-events-none" />
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden ring-2 ring-primary/40 bg-gradient-to-br from-primary/40 to-purple-600/40">
                          <img src={m.img} alt={m.name} onError={(e)=>{(e.currentTarget.src='/placeholder.svg')}} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="mt-4 font-semibold text-sm leading-tight">{m.name} – {m.title}</h3>
                        <p className="mt-2 text-[11px] text-primary/90 font-medium">What he did:</p>
                        <ul className="mt-1 space-y-1 text-[10px] text-muted-foreground text-left list-disc list-outside mx-auto pl-4">
                          {m.contributions.map(c=> <li key={c}>{c}</li>)}
                        </ul>
                        <p className="mt-3 text-[11px] text-foreground/90 italic leading-relaxed">{m.bio}</p>
                        <div className="flex gap-4 mt-4 justify-center">
                          {m.linkedin && <a href={m.linkedin} className="text-muted-foreground hover:text-primary" aria-label="LinkedIn"><Linkedin className="w-4 h-4"/></a>}
                          {m.email && <a href={m.email} className="text-muted-foreground hover:text-primary" aria-label="Email"><Mail className="w-4 h-4" /></a>}
                        </div>
                      </div>
                    </div>
                    <span className="hidden md:block absolute left-1/2 -bottom-12 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-primary/50 to-primary/10" />
                  </div>
                ))}
              </div>
              <div className="hidden md:block" />
              <div className="hidden md:block" />
              <div className="hidden md:block" />

              {/* Row 2: Core Engineers */}
              <div className="md:col-span-2 flex justify-center md:justify-end mt-16 md:mt-0">
                {team.filter(t=>t.name==='John Nyamweya').map(m => (
                  <div key={m.name} className="relative group">
                    <span className="hidden md:block absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-primary/30 to-primary/60" />
                    <div className={`relative rounded-2xl border p-6 w-72 flex flex-col text-center overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-oxford-900/70 border-primary/25'} shadow-sm hover:shadow-lg transition-all hover:-translate-y-1`}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(at_50%_50%,rgba(59,130,246,0.28),transparent_38%,rgba(59,130,246,0.28))] pointer-events-none" />
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden ring-2 ring-primary/40 bg-gradient-to-br from-primary/40 to-purple-600/40">
                          <img src={m.img} alt={m.name} onError={(e)=>{(e.currentTarget.src='/placeholder.svg')}} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="mt-4 font-semibold text-sm leading-tight">{m.name} – {m.title}</h3>
                        <p className="mt-2 text-[11px] text-primary/90 font-medium">What he did:</p>
                        <ul className="mt-1 space-y-1 text-[10px] text-muted-foreground text-left list-disc list-outside mx-auto pl-4">
                          {m.contributions.map(c=> <li key={c}>{c}</li>)}
                        </ul>
                        <p className="mt-3 text-[11px] text-foreground/90 italic leading-relaxed">{m.bio}</p>
                        <div className="flex gap-4 mt-4 justify-center">
                          {m.github && <a href={m.github} className="text-muted-foreground hover:text-primary" aria-label="GitHub"><Github className="w-4 h-4"/></a>}
                          {m.linkedin && <a href={m.linkedin} className="text-muted-foreground hover:text-primary" aria-label="LinkedIn"><Linkedin className="w-4 h-4"/></a>}
                          {m.portfolio && <a href={m.portfolio} className="text-muted-foreground hover:text-primary" aria-label="Portfolio"><Globe className="w-4 h-4" /></a>}
                        </div>
                      </div>
                    </div>
                    <span className="hidden md:block absolute top-1/2 right-full w-10 h-px bg-gradient-to-l from-primary/40 to-primary/10" />
                  </div>
                ))}
              </div>
              <div className="md:col-span-3 flex justify-center items-start mt-16 md:mt-0">
                <div className="hidden md:block relative w-full h-px mt-12 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              </div>
              <div className="md:col-span-2 flex justify-center md:justify-start mt-16 md:mt-0">
                {team.filter(t=>t.name==='Kelvin Muemah').map(m => (
                  <div key={m.name} className="relative group">
                    <span className="hidden md:block absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-primary/30 to-primary/60" />
                    <div className={`relative rounded-2xl border p-6 w-72 flex flex-col text-center overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-oxford-900/70 border-primary/25'} shadow-sm hover:shadow-lg transition-all hover:-translate-y-1`}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(at_50%_50%,rgba(59,130,246,0.28),transparent_38%,rgba(59,130,246,0.28))] pointer-events-none" />
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden ring-2 ring-primary/40 bg-gradient-to-br from-primary/40 to-purple-600/40">
                          <img src={m.img} alt={m.name} onError={(e)=>{(e.currentTarget.src='/placeholder.svg')}} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="mt-4 font-semibold text-sm leading-tight">{m.name} – {m.title}</h3>
                        <p className="mt-2 text-[11px] text-primary/90 font-medium">What he did:</p>
                        <ul className="mt-1 space-y-1 text-[10px] text-muted-foreground text-left list-disc list-outside mx-auto pl-4">
                          {m.contributions.map(c=> <li key={c}>{c}</li>)}
                        </ul>
                        <p className="mt-3 text-[11px] text-foreground/90 italic leading-relaxed">{m.bio}</p>
                        <div className="flex gap-4 mt-4 justify-center">
                          {m.github && <a href={m.github} className="text-muted-foreground hover:text-primary" aria-label="GitHub"><Github className="w-4 h-4"/></a>}
                          {m.linkedin && <a href={m.linkedin} className="text-muted-foreground hover:text-primary" aria-label="LinkedIn"><Linkedin className="w-4 h-4"/></a>}
                        </div>
                      </div>
                    </div>
                    <span className="hidden md:block absolute top-1/2 left-full w-10 h-px bg-gradient-to-r from-primary/40 to-primary/10" />
                  </div>
                ))}
              </div>

              {/* Row 3: Collaborators */}
              <div className="md:col-span-7 mt-24 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
                {team.filter(t=>!t.highlight && t.name!=='John Nyamweya' && t.name!=='Kelvin Muemah').map(m => (
                  <div key={m.name} className={`relative group ${m.name==='Derrick' ? 'lg:ml-16 xl:ml-24' : ''}`}> 
                    <div className={`relative rounded-2xl border p-6 w-64 flex flex-col text-center overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-oxford-900/60 border-primary/25'} hover:-translate-y-1 hover:shadow-lg transition-all`}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/40 via-transparent to-white/20 dark:from-white/20 dark:via-transparent dark:to-white/10 pointer-events-none" />
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden ring-2 ring-primary/30 bg-gradient-to-br from-primary/30 to-purple-600/30">
                          <img src={m.img} alt={m.name} onError={(e)=>{(e.currentTarget.src='/placeholder.svg')}} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="mt-4 font-semibold text-sm leading-tight">{m.name} – {m.title}</h4>
                        <p className="mt-2 text-[11px] text-primary/90 font-medium">What they did:</p>
                        <ul className="mt-1 space-y-1 text-[10px] text-muted-foreground text-left list-disc list-outside mx-auto pl-4">
                          {m.contributions.map(c=> <li key={c}>{c}</li>)}
                        </ul>
                        <p className="mt-3 text-[11px] text-foreground/90 italic leading-relaxed">{m.bio}</p>
                        <div className="flex gap-4 mt-4 justify-center">
                          {m.github && <a href={m.github} className="text-muted-foreground hover:text-primary" aria-label="GitHub"><Github className="w-4 h-4"/></a>}
                          {m.linkedin && <a href={m.linkedin} className="text-muted-foreground hover:text-primary" aria-label="LinkedIn"><Linkedin className="w-4 h-4"/></a>}
                        </div>
                      </div>
                    </div>
                    <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 w-px h-10 bg-gradient-to-b from-primary/30 to-transparent" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Philosophy + Collaboration Nodes */}
        <div className="mt-24 relative z-10 max-w-5xl mx-auto">
          <ObserverReveal className="mb-10 text-center">
            <h3 className="text-3xl font-bold">How We Think & Build</h3>
          </ObserverReveal>

          <div className="relative">
            {/* vertical guide line (mobile) */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/10 to-transparent md:hidden" />
            <ul className="space-y-14">
              {[
                {
                  title: 'Our Philosophy',
                  body: 'We’re not just coders, we’re problem‑solvers. Every feature we ship is guided by empathy for students, a commitment to transparent data, and a relentless pursuit of usability & trust.',
                  ml: 'md:ml-0'
                },
                {
                  title: 'Collaborate With Us',
                  body: 'We’re open to meaningful collaboration. If you’re passionate about housing, safety or student experience design, let’s build the future together.',
                  ml: 'md:ml-10'
                },
                {
                  title: 'Join Us',
                  body: 'Contribute code, research, design insight or community knowledge. Let’s co‑create safer, smarter student housing access.',
                  ml: 'md:ml-20',
                  cta: true
                }
              ].map((n, i, arr) => (
                <li key={n.title} className={`relative group ${n.ml} transition-all`}> 
                  {/* connector lines (desktop) */}
                  {i < arr.length - 1 && (
                    <span className="hidden md:block absolute left-8 top-12 h-full w-px bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />
                  )}
                  {/* indentation guide (desktop) */}
                  <span className="hidden md:block absolute top-12 left-0 h-px w-6 bg-gradient-to-r from-primary/40 to-primary/10" />
                  {/* node */}
                  <div className={`relative pl-20 md:pl-24`}> 
                    <span className="absolute left-0 top-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-purple-600/30 flex items-center justify-center text-sm font-semibold text-primary ring-2 ring-primary/40 shadow-md shadow-primary/20 backdrop-blur-sm">
                      {String(i+1).padStart(2,'0')}
                    </span>
                    <div className={`rounded-2xl border p-6 md:p-8 transition-all ${isLight ? 'bg-white/70 border-gray-200' : 'bg-oxford-900/60 border-primary/25 backdrop-blur'} group-hover:border-primary/50 group-hover:shadow-[0_0_0_1px_rgba(var(--primary-rgb),0.4)]`}> 
                      <h4 className="text-xl font-semibold flex items-center gap-2 mb-3">
                        <span className="text-primary/70 font-mono text-sm">{`step_${i+1}`}</span>
                        <span>{n.title}</span>
                      </h4>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">{n.body}</p>
                      {n.cta && (
                        <div className="flex flex-wrap items-center gap-4">
                          <button onClick={() => window.alert('Collaboration page coming soon.')} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors">
                            Join Us <span>→</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
  </div>
  </div>
      </section>

      {/* Timeline */}
      <section className="px-6 md:px-12 py-12">
        <ObserverReveal className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Our Journey</h2>
          <p className="text-muted-foreground max-w-2xl">Milestones that shape the evolution of the platform.</p>
        </ObserverReveal>
        <div className="relative pl-6 before:content-[''] before:absolute before:left-1.5 before:top-0 before:bottom-0 before:w-px before:bg-primary/30 space-y-10">
          {[
            { date: '2025', title: 'Founded', text: 'Conceptualized at MMUST, Kenya focusing on transparent student housing.' },
            { date: '2025 Q2', title: 'Prototype', text: 'Launched initial MVP with listings, search & reviews.' },
            { date: 'Future', title: 'Expansion', text: 'Scaling to more regions & deeper verification tooling.' }
          ].map((e, i) => (
            <ObserverReveal key={e.title} className="relative">
              <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-background">{i+1}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Calendar className="w-4 h-4" /> {e.date}</div>
                <h4 className="font-semibold text-foreground">{e.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{e.text}</p>
              </div>
            </ObserverReveal>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="px-6 md:px-12 py-16 grid gap-12 md:grid-cols-2">
        <ObserverReveal>
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-muted-foreground mb-6">Feedback, partnership ideas or issues? Reach out anytime.</p>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> <span>+254 700 123 456</span></li>
            <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> <span>support@comradekejani.example</span></li>
            <li className="flex items-center gap-3"><Globe className="w-4 h-4 text-primary" /> <span>www.comradekejani.example</span></li>
            <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary" /> <span>MMUST, Kakamega, Kenya</span></li>
          </ul>
        </ObserverReveal>
        <ObserverReveal className={`rounded-xl border p-6 ${isLight ? 'bg-white border-gray-200' : 'bg-oxford-900 border-primary/20'}`} animation="animate-fadeInUp">
          <form onSubmit={e => { e.preventDefault(); alert('Message sent (placeholder).'); (e.target as HTMLFormElement).reset(); }} className="space-y-5">
            <div className="relative">
              <input required name="name" placeholder=" " className="peer w-full rounded-md border bg-transparent px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <label className="pointer-events-none absolute left-3 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs">Name</label>
            </div>
            <div className="relative">
              <input required name="email" type="email" placeholder=" " className="peer w-full rounded-md border bg-transparent px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <label className="pointer-events-none absolute left-3 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs">Email</label>
            </div>
            <div className="relative">
              <textarea required name="message" placeholder=" " rows={4} className="peer w-full rounded-md border bg-transparent px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <label className="pointer-events-none absolute left-3 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs">Message</label>
            </div>
            <button type="submit" className="w-full rounded-md bg-primary/90 hover:bg-primary text-white py-2 text-sm font-medium transition-colors">Send Message</button>
          </form>
        </ObserverReveal>
      </section>

      {/* Footer Legal */}
      <footer className="px-6 md:px-12 py-10 border-t border-border/60 text-xs flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} Nyamweya John & Kelvin Muemah. All Rights Reserved.</div>
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <Link to="/terms" className="hover:text-primary">Terms</Link>
          <Link to="/privacy" className="hover:text-primary">Privacy</Link>
          <Link to="/licensing" className="hover:text-primary">Licensing</Link>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
