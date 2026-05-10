import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  Calendar, 
  ChevronRight, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  BookOpen,
  PieChart,
  Video,
  FileDown,
  ExternalLink,
  MessageSquare,
  Bell,
  MoreVertical,
  Trash2,
  Edit,
  Save,
  Check,
  AlertCircle,
  File,
  Filter,
  Monitor,
  Download,
  Upload,
  Calendar as CalendarIcon,
  User,
  Shield,
  Briefcase,
  Layers,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  assignmentsCompleted: number;
  gradeAverage: number;
  lastActive: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  linkedStudentIds: string[];
}

interface Category {
  id: string;
  name: string;
}

interface Document {
  id: string;
  title: string;
  category: string;
  type: 'pdf' | 'video' | 'doc' | 'link';
  url: string;
  uploadDate: string;
  isGoogleDoc?: boolean;
}

interface Assignment {
  id: string;
  title: string;
  category: string;
  deadline: string;
  status: 'active' | 'expired';
  submissions: number;
  totalStudents: number;
}

interface Exam {
  id: string;
  title: string;
  url: string;
  deadline: string;
  status: 'active' | 'expired';
}

interface CalendarEvent {
  id: string;
  studentId: string; // UPDATED: Added to track which student sees this
  title: string;
  date: string;
  time: string;
  description?: string;
  status?: string;
  recordingUrl?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

const App: React.FC = () => {
  // --- STATE ---
  const [userRole, setUserRole] = useState<'teacher' | 'student' | 'parent' | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Auth Dummy State
  const [currentStudentUser, setCurrentStudentUser] = useState<Student | null>(null);
  const [currentParentUser, setCurrentParentUser] = useState<Parent | null>(null);

  // Form States (Teacher)
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docType, setDocType] = useState<'pdf' | 'video' | 'doc' | 'link'>('pdf');
  const [isGoogleDoc, setIsGoogleDoc] = useState(false);

  const [assignTitle, setAssignTitle] = useState('');
  const [assignCategory, setAssignCategory] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');

  const [examTitle, setExamTitle] = useState('');
  const [examUrl, setExamUrl] = useState('');
  const [examDeadline, setExamDeadline] = useState('');

  const [calTitle, setCalTitle] = useState('');
  const [calDate, setCalDate] = useState('');
  const [calTime, setCalTime] = useState('');
  const [calDesc, setCalDesc] = useState('');
  const [calStudentId, setCalStudentId] = useState('all'); // UPDATED: Default to all class

  // --- INITIAL LOAD & SYNC ---
  useEffect(() => {
    // Initial fallback load from LocalStorage to guarantee instant display
    const savedStudents = localStorage.getItem('derslink_students');
    const savedParents = localStorage.getItem('derslink_parents');
    const savedCategories = localStorage.getItem('derslink_categories');
    const savedDocs = localStorage.getItem('derslink_documents');
    const savedAssignments = localStorage.getItem('derslink_assignments');
    const savedExams = localStorage.getItem('derslink_exams');
    const savedEvents = localStorage.getItem('derslink_events');
    
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedParents) setParents(JSON.parse(savedParents));
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      const initialCats = ['Konu Özetleri', 'Konu Anlatılış Özetleri', 'Konu Anlatılış Videoları', 'Soru Çözüm Analizleri', 'PDF Dökümanlar'];
      setCategories(initialCats);
      localStorage.setItem('derslink_categories', JSON.stringify(initialCats));
    }

    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
    if (savedExams) setExams(JSON.parse(savedExams));
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    
    // Set default category if none selected
    if (categories.length > 0) {
      setDocCategory(categories[0]);
      setAssignCategory(categories[0]);
    } else {
      setDocCategory('Konu Özetleri');
      setAssignCategory('Konu Özetleri');
    }
  }, []);

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('derslink_students', JSON.stringify(students));
    localStorage.setItem('derslink_parents', JSON.stringify(parents));
    localStorage.setItem('derslink_categories', JSON.stringify(categories));
    localStorage.setItem('derslink_documents', JSON.stringify(documents));
    localStorage.setItem('derslink_assignments', JSON.stringify(assignments));
    localStorage.setItem('derslink_exams', JSON.stringify(exams));
    localStorage.setItem('derslink_events', JSON.stringify(events));
  }, [students, parents, categories, documents, assignments, exams, events]);

  // --- PERSISTENCE UTILS ---
  const saveDocToFirebase = async (collection: string, id: string, data: any) => {
    // Simulate API call. In real app, use Firebase SDK here.
    console.log(`Saving to ${collection}/${id}:`, data);
  };

  const deleteDocFromFirebase = async (collection: string, id: string) => {
    console.log(`Deleting from ${collection}/${id}`);
  };

  // --- TEACHER HANDLERS ---
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) return;

    const newStudent: Student = {
      id: 'st_' + Date.now(),
      name: newStudentName,
      email: newStudentEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newStudentName)}&background=random`,
      assignmentsCompleted: 0,
      gradeAverage: 0,
      lastActive: 'Az Önce'
    };

    setStudents([...students, newStudent]);
    await saveDocToFirebase('students', newStudent.id, newStudent);
    
    setNewStudentName('');
    setNewStudentEmail('');
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docUrl) return;

    const newDoc: Document = {
      id: 'doc_' + Date.now(),
      title: docTitle,
      category: docCategory,
      type: docType,
      url: docUrl,
      uploadDate: new Date().toLocaleDateString('tr-TR'),
      isGoogleDoc: isGoogleDoc
    };

    setDocuments([newDoc, ...documents]);
    await saveDocToFirebase('documents', newDoc.id, newDoc);

    setDocTitle('');
    setDocUrl('');
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle || !assignDeadline) return;

    const newAssign: Assignment = {
      id: 'asg_' + Date.now(),
      title: assignTitle,
      category: assignCategory,
      deadline: assignDeadline,
      status: 'active',
      submissions: 0,
      totalStudents: students.length
    };

    setAssignments([newAssign, ...assignments]);
    await saveDocToFirebase('assignments', newAssign.id, newAssign);

    setAssignTitle('');
    setAssignDeadline('');
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle || !examUrl || !examDeadline) return;

    const newExam: Exam = {
      id: 'exm_' + Date.now(),
      title: examTitle,
      url: examUrl,
      deadline: examDeadline,
      status: 'active'
    };

    setExams([newExam, ...exams]);
    await saveDocToFirebase('exams', newExam.id, newExam);

    setExamTitle('');
    setExamUrl('');
    setExamDeadline('');
  };

  const handleCreateCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calTitle || !calDate || !calTime) return;

    const newEvt: CalendarEvent = {
      id: 'evt_' + Date.now(),
      studentId: calStudentId, // UPDATED: Save the selected student ID
      title: calTitle,
      date: calDate,
      time: calTime,
      description: calDesc || 'Planlı Canlı Ders.',
      status: 'Planlandı'
    };

    setEvents([newEvt, ...events]);
    await saveDocToFirebase('calendar', newEvt.id, newEvt);

    setCalTitle('');
    setCalDate('');
    setCalTime('');
    setCalDesc('');
    setCalStudentId('all'); // Reset to all
  };

  const deleteItem = async (type: string, id: string) => {
    if (!window.confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;
    
    switch(type) {
      case 'student': setStudents(students.filter(i => i.id !== id)); break;
      case 'document': setDocuments(documents.filter(i => i.id !== id)); break;
      case 'assignment': setAssignments(assignments.filter(i => i.id !== id)); break;
      case 'exam': setExams(exams.filter(i => i.id !== id)); break;
      case 'event': setEvents(events.filter(i => i.id !== id)); break;
    }
    await deleteDocFromFirebase(type, id);
  };

  // --- RENDER HELPERS ---
  const RoleSelector = () => (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/20">
              <GraduationCap size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">DERSLİNK <span className="text-blue-500">AI</span></h1>
          <p className="text-slate-400 font-medium">Geleceğin Eğitim Yönetim Platformu</p>
        </div>

        <div className="grid gap-4">
          <button 
            onClick={() => setUserRole('teacher')}
            className="group relative bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5 transition-all hover:bg-slate-800 hover:border-blue-500 hover:scale-[1.02] active:scale-95 shadow-lg"
          >
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500 transition-colors">
              <Shield size={28} className="text-blue-500 group-hover:text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-bold text-lg">Öğretmen Girişi</h3>
              <p className="text-slate-500 text-sm">Sınıfı yönet, doküman yükle, analiz yap.</p>
            </div>
            <ChevronRight className="ml-auto text-slate-700 group-hover:text-blue-500" />
          </button>

          <button 
            onClick={() => {
              if (students.length === 0) {
                alert("Henüz öğrenci eklenmemiş. Lütfen önce öğretmen olarak öğrenci ekleyin.");
                return;
              }
              setCurrentStudentUser(students[0]);
              setUserRole('student');
            }}
            className="group relative bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5 transition-all hover:bg-slate-800 hover:border-purple-500 hover:scale-[1.02] active:scale-95 shadow-lg"
          >
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500 transition-colors">
              <User size={28} className="text-purple-500 group-hover:text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-bold text-lg">Öğrenci Girişi</h3>
              <p className="text-slate-500 text-sm">Ödevlerini gör, derslere katıl, döküman indir.</p>
            </div>
            <ChevronRight className="ml-auto text-slate-700 group-hover:text-purple-500" />
          </button>

          <button 
            onClick={() => {
              if (parents.length === 0) {
                alert("Henüz veli eklenmemiş.");
                return;
              }
              setCurrentParentUser(parents[0]);
              setUserRole('parent');
            }}
            className="group relative bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5 transition-all hover:bg-slate-800 hover:border-emerald-500 hover:scale-[1.02] active:scale-95 shadow-lg"
          >
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500 transition-colors">
              <Users size={28} className="text-emerald-500 group-hover:text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-bold text-lg">Veli Girişi</h3>
              <p className="text-slate-500 text-sm">Öğrenci gelişimini takip et, takvimi kontrol et.</p>
            </div>
            <ChevronRight className="ml-auto text-slate-700 group-hover:text-emerald-500" />
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold">Powered by Gemini Ultra 2.0</p>
        </div>
      </div>
    </div>
  );

  const TeacherSidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-900 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter">DERSLİNK <span className="text-blue-500">PRO</span></span>
        </div>

        <nav className="flex-1 space-y-1.5">
          <SidebarLink active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <SidebarLink active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={20}/>} label="Öğrenci Yönetimi" />
          <SidebarLink active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} icon={<BookOpen size={20}/>} label="Eğitim Materyalleri" />
          <SidebarLink active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} icon={<FileText size={20}/>} label="Ödevler & Sınavlar" />
          <SidebarLink active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar size={20}/>} label="Canlı Ders Takvimi" />
          <SidebarLink active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<PieChart size={20}/>} label="Analiz Raporları" />
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-slate-900">
          <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-900/40">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">ÖK</div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold truncate">Öğr. Kaan Yılmaz</p>
              <p className="text-slate-500 text-[10px] truncate">Matematik Bölüm Başkanı</p>
            </div>
          </div>
          <button 
            onClick={() => setUserRole(null)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );

  const SidebarLink = ({ active, icon, label, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
    >
      <span className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-500'} transition-colors`}>{icon}</span>
      <span className="font-bold text-sm tracking-tight">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
    </button>
  );

  // --- SUB-PANELS ---
  
  const TeacherDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Hoş Geldiniz, Kaan Bey 👋</h2>
          <p className="text-slate-400 mt-1">Bugün sınıfınızda neler olup bittiğine bir göz atalım.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">Sistem Aktif</span>
          </div>
          <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <Bell size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Toplam Öğrenci" value={students.length.toString()} icon={<Users className="text-blue-500" />} trend="+2 Yeni" />
        <StatCard title="Aktif Ödevler" value={assignments.length.toString()} icon={<FileText className="text-purple-500" />} trend="5 Bugün" />
        <StatCard title="Tamamlanma" value="%84" icon={<CheckCircle2 className="text-emerald-500" />} trend="+%12 Artış" />
        <StatCard title="Ortalama Başarı" value="B+" icon={<PieChart className="text-amber-500" />} trend="Kararlı" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-900 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white">Son Etkinlikler</h3>
              <button className="text-blue-500 text-xs font-bold hover:underline">Tümünü Gör</button>
            </div>
            <div className="space-y-4">
              {students.slice(0, 3).map(st => (
                <div key={st.id} className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-900/50 hover:border-slate-800 transition-all">
                  <img src={st.avatar} alt={st.name} className="w-12 h-12 rounded-xl" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold">{st.name}</p>
                    <p className="text-slate-500 text-xs">"Üçgenlerde Açılar" ödevini teslim etti.</p>
                  </div>
                  <span className="text-slate-600 text-[10px] font-medium">14dk önce</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-xl shadow-blue-900/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-white font-black text-xl mb-2">Hızlı Kurulum</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">Öğrencilerinize hemen doküman veya ödev göndermek için sihirbazı kullanın.</p>
              <button onClick={() => setActiveTab('docs')} className="w-full bg-white text-blue-600 font-black py-3 rounded-xl text-sm transition-all hover:bg-blue-50 hover:scale-[1.02] active:scale-95">BAŞLAT</button>
            </div>
            <div className="absolute -bottom-6 -right-6 text-white/10 group-hover:scale-125 transition-transform duration-700">
              <Monitor size={140} />
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6">
            <h3 className="text-white font-black text-lg mb-4">Yaklaşan Dersler</h3>
            <div className="space-y-3">
              {events.slice(0, 2).map(e => (
                <div key={e.id} className="p-3 bg-slate-950 border-l-4 border-blue-500 rounded-r-xl">
                  <p className="text-white text-xs font-bold">{e.title}</p>
                  <p className="text-slate-500 text-[10px] flex items-center gap-1 mt-1">
                    <Clock size={10} /> {e.time} | {e.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon, trend }: any) => (
    <div className="bg-slate-900/50 border border-slate-900 p-6 rounded-3xl transition-all hover:bg-slate-900 hover:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-slate-950 rounded-xl">{icon}</div>
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{trend}</span>
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
      <h4 className="text-3xl font-black text-white mt-1">{value}</h4>
    </div>
  );

  const TeacherStudents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">Öğrenci Yönetimi</h2>
        <button onClick={() => (document.getElementById('add-student-modal') as any).showModal()} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-2 transition-all">
          <Plus size={18} /> Yeni Öğrenci
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-900 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Öğrenci</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">E-Posta</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ödevler</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ortalama</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/50">
            {students.map(st => (
              <tr key={st.id} className="hover:bg-slate-900/50 transition-all group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={st.avatar} className="w-9 h-9 rounded-lg" alt="" />
                    <span className="text-white text-sm font-bold">{st.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">{st.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(st.assignmentsCompleted / 10) * 100}%` }} />
                    </div>
                    <span className="text-white text-xs font-bold">{st.assignmentsCompleted}/10</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-[10px] font-black tracking-widest">88.4</span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => deleteItem('student', st.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog id="add-student-modal" className="modal bg-slate-950 border border-slate-900 rounded-3xl p-8 shadow-2xl backdrop:bg-slate-950/80 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white">Yeni Öğrenci Ekle</h3>
          <button onClick={() => (document.getElementById('add-student-modal') as any).close()} className="text-slate-500 hover:text-white"><X size={20}/></button>
        </div>
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">Tam Adı</label>
            <input 
              type="text" 
              required
              value={newStudentName}
              onChange={e => setNewStudentName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none" 
              placeholder="Örn: Ahmet Yılmaz" 
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">E-Posta Adresi</label>
            <input 
              type="email" 
              required
              value={newStudentEmail}
              onChange={e => setNewStudentEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none" 
              placeholder="ahmet@okul.com" 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl mt-4 transition-all">SİSTEME KAYDET</button>
        </form>
      </dialog>
    </div>
  );

  const TeacherDocs = () => (
    <div className="space-y-8">
      <div className="bg-slate-900 border border-slate-900 rounded-3xl p-8">
        <h2 className="text-xl font-black text-white mb-6">Doküman Yükle & Paylaş</h2>
        <form onSubmit={handleUploadDoc} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="lg:col-span-2">
            <label className="block text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-widest">Başlık</label>
            <input 
              type="text" 
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500" 
              placeholder="Örn: Fonksiyonlar Konu Özeti" 
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-widest">Kategori</label>
            <select 
              value={docCategory}
              onChange={e => setDocCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-widest">Tür</label>
            <select 
              value={docType}
              onChange={e => setDocType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none"
            >
              <option value="pdf">PDF Belgesi</option>
              <option value="video">Video Linki</option>
              <option value="doc">Google Doküman</option>
              <option value="link">Web Bağlantısı</option>
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="block text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-widest">Dosya / Link URL</label>
            <div className="relative">
              <input 
                type="text" 
                value={docUrl}
                onChange={e => setDocUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-10 text-sm text-white outline-none focus:border-blue-500" 
                placeholder="https://drive.google.com/..." 
              />
              <ExternalLink className="absolute left-3 top-3.5 text-slate-700" size={16} />
            </div>
          </div>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
            <Upload size={18} /> YAYINLA
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
          <div key={doc.id} className="bg-slate-900/50 border border-slate-900 rounded-3xl p-6 hover:bg-slate-900 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-950 rounded-2xl">
                {doc.type === 'video' ? <Video className="text-red-500" /> : doc.type === 'pdf' ? <FileText className="text-orange-500" /> : <File className="text-blue-500" />}
              </div>
              <button onClick={() => deleteItem('document', doc.id)} className="p-2 text-slate-800 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <h3 className="text-white font-bold mb-1 truncate">{doc.title}</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">{doc.category}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-900">
              <span className="text-slate-600 text-[10px] font-medium">{doc.uploadDate}</span>
              <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 font-bold text-xs flex items-center gap-1">
                GÖRÜNTÜLE <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TeacherAssignments = () => (
    <div className="space-y-10">
      {/* Ödev Bölümü */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Aktif Ödevler</h2>
          <button onClick={() => (document.getElementById('modal-assignment') as any).showModal()} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2">
            <Plus size={16} /> ÖDEV VER
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map(asg => (
            <div key={asg.id} className="bg-slate-900/50 border border-slate-900 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl"><FileText className="text-purple-500" /></div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm">{asg.title}</h4>
                <p className="text-slate-500 text-[10px] mt-0.5 uppercase font-black">{asg.category} • Son: {asg.deadline}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-sm">{asg.submissions}/{asg.totalStudents}</p>
                <p className="text-slate-600 text-[10px] font-bold">TESLİM</p>
              </div>
              <button onClick={() => deleteItem('assignment', asg.id)} className="p-2 text-slate-800 hover:text-red-500 ml-2">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sınav Bölümü */}
      <div className="space-y-6 pt-10 border-t border-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Online Sınavlar</h2>
          <button onClick={() => (document.getElementById('modal-exam') as any).showModal()} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2">
            <Plus size={16} /> SINAV OLUŞTUR
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {exams.map(exm => (
            <div key={exm.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3">
                <button onClick={() => deleteItem('exam', exm.id)} className="text-slate-700 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4"><CheckCircle2 className="text-amber-500" /></div>
              <h3 className="text-white font-black mb-1">{exm.title}</h3>
              <p className="text-slate-500 text-xs mb-6">Son Katılım: {exm.deadline}</p>
              <a href={exm.url} target="_blank" rel="noreferrer" className="block w-full py-3 bg-slate-950 border border-slate-800 text-slate-300 text-center rounded-xl text-xs font-black group-hover:bg-amber-600 group-hover:text-white transition-all group-hover:border-amber-600">SINAV LİNKİNE GİT</a>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <dialog id="modal-assignment" className="modal bg-slate-950 border border-slate-900 rounded-3xl p-8 max-w-md w-full">
        <h3 className="text-xl font-black text-white mb-6">Yeni Ödev Oluştur</h3>
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <input type="text" value={assignTitle} onChange={e => setAssignTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" placeholder="Ödev Başlığı" />
          <select value={assignCategory} onChange={e => setAssignCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={assignDeadline} onChange={e => setAssignDeadline(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
          <button type="submit" className="w-full bg-purple-600 text-white font-black py-3 rounded-xl mt-4">YAYINLA</button>
          <button type="button" onClick={() => (document.getElementById('modal-assignment') as any).close()} className="w-full text-slate-500 font-bold py-2">İptal</button>
        </form>
      </dialog>

      <dialog id="modal-exam" className="modal bg-slate-950 border border-slate-900 rounded-3xl p-8 max-w-md w-full">
        <h3 className="text-xl font-black text-white mb-6">Yeni Sınav Linki Ekle</h3>
        <form onSubmit={handleCreateExam} className="space-y-4">
          <input type="text" value={examTitle} onChange={e => setExamTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" placeholder="Sınav Adı (Örn: TYT Deneme-1)" />
          <input type="text" value={examUrl} onChange={e => setExamUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" placeholder="Sınav Linki (Google Forms vb.)" />
          <input type="date" value={examDeadline} onChange={e => setExamDeadline(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none" />
          <button type="submit" className="w-full bg-amber-600 text-white font-black py-3 rounded-xl mt-4">SİSTEME EKLE</button>
          <button type="button" onClick={() => (document.getElementById('modal-exam') as any).close()} className="w-full text-slate-500 font-bold py-2">İptal</button>
        </form>
      </dialog>
    </div>
  );

  const TeacherCalendar = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-slate-900 border border-slate-900 rounded-3xl p-8 sticky top-8">
          <h2 className="text-xl font-black text-white mb-6">Ders Planla</h2>
          <form onSubmit={handleCreateCalendarEvent} className="space-y-5">
            <div className="mb-4">
              <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">Kime Görünsün?</label>
              <select 
                value={calStudentId} 
                onChange={(e) => setCalStudentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="all">📢 Tüm Sınıf (Herkes Görür)</option>
                {students.map(st => (
                  <option key={st.id} value={st.id}>👤 {st.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">Ders Başlığı</label>
              <input type="text" value={calTitle} onChange={e => setCalTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500" placeholder="Örn: Limit ve Süreklilik" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">Tarih</label>
                <input type="date" value={calDate} onChange={e => setCalDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">Saat</label>
                <input type="time" value={calTime} onChange={e => setCalTime(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">Açıklama</label>
              <textarea value={calDesc} onChange={e => setCalDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none min-h-[100px]" placeholder="Ders içeriği hakkında kısa bilgi..."></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/20">TAKVİME EKLE</button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-black text-white">Ajanda</h2>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
              <CalendarIcon size={48} className="text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Henüz planlanmış bir ders yok.</p>
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="bg-slate-900/50 border border-slate-900 rounded-3xl p-6 flex items-start gap-6 hover:bg-slate-900 transition-all">
                <div className="bg-blue-600 p-4 rounded-2xl text-center min-w-[80px]">
                  <p className="text-[10px] text-blue-200 font-black uppercase">{new Date(event.date).toLocaleDateString('tr-TR', { month: 'short' })}</p>
                  <p className="text-2xl font-black text-white">{new Date(event.date).getDate()}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-black text-lg">{event.title}</h3>
                    <span className="bg-blue-500/10 text-blue-500 text-[10px] px-2 py-0.5 rounded font-black uppercase">{event.status}</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{event.description}</p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <Clock size={14} className="text-blue-500" /> {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <User size={14} className="text-blue-500" /> {event.studentId === 'all' ? 'Tüm Sınıf' : 'Özel Ders'}
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteItem('event', event.id)} className="p-2 text-slate-800 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // --- STUDENT PANEL ---
  const StudentLayout = () => {
    const [studentTab, setStudentTab] = useState('dashboard');
    
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <div className="fixed inset-y-0 left-0 w-20 lg:w-72 bg-slate-950 border-r border-slate-900 flex flex-col p-4 lg:p-6 transition-all">
          <div className="flex items-center gap-3 mb-12 lg:px-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="hidden lg:inline text-xl font-black text-white tracking-tighter">DERSLİNK <span className="text-purple-500">STUDENT</span></span>
          </div>

          <nav className="flex-1 space-y-4">
            <button onClick={() => setStudentTab('dashboard')} className={`w-full flex items-center gap-4 p-3 lg:px-4 lg:py-3 rounded-2xl transition-all ${studentTab === 'dashboard' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
              <LayoutDashboard size={24} /> <span className="hidden lg:inline font-bold">Panel</span>
            </button>
            <button onClick={() => setStudentTab('docs')} className={`w-full flex items-center gap-4 p-3 lg:px-4 lg:py-3 rounded-2xl transition-all ${studentTab === 'docs' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
              <BookOpen size={24} /> <span className="hidden lg:inline font-bold">Dersler</span>
            </button>
            <button onClick={() => setStudentTab('calendar')} className={`w-full flex items-center gap-4 p-3 lg:px-4 lg:py-3 rounded-2xl transition-all ${studentTab === 'calendar' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
              <Calendar size={24} /> <span className="hidden lg:inline font-bold">Takvim</span>
            </button>
          </nav>

          <button onClick={() => setUserRole(null)} className="flex items-center gap-4 p-3 lg:px-4 lg:py-3 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all mt-auto">
            <LogOut size={24} /> <span className="hidden lg:inline font-bold">Çıkış</span>
          </button>
        </div>

        <main className="flex-1 ml-20 lg:ml-72 p-4 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white">Selam, {currentStudentUser?.name} ✨</h1>
                <p className="text-slate-500 mt-1">Öğrenme yolculuğuna devam et!</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-white text-xs font-black">Puan: 1,240</p>
                  <p className="text-purple-500 text-[10px] font-bold uppercase">Sıralama: #4</p>
                </div>
                <img src={currentStudentUser?.avatar} className="w-12 h-12 rounded-2xl border-2 border-slate-800" alt="" />
              </div>
            </header>

            {studentTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 shadow-xl shadow-purple-900/20">
                    <h3 className="text-white font-black text-2xl mb-2">Google Takvim Entegrasyonu</h3>
                    <p className="text-purple-100 mb-6 max-w-md">Tüm derslerin ve ödevlerin Google Takvim'in ile senkronize. Hiçbirini kaçırma!</p>
                    <button className="bg-white text-purple-600 font-black px-6 py-3 rounded-xl text-sm flex items-center gap-2 transition-transform active:scale-95">
                      <CalendarIcon size={18} /> TAKVİMİ AÇ
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-white">Bekleyen Ödevlerin</h3>
                    <div className="grid gap-4">
                      {assignments.map(asg => (
                        <div key={asg.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between group hover:border-purple-500 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500 transition-all"><FileText className="text-purple-500 group-hover:text-white" /></div>
                            <div>
                              <p className="text-white font-bold">{asg.title}</p>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{asg.category} • Son Tarih: {asg.deadline}</p>
                            </div>
                          </div>
                          <button className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-white hover:text-black transition-all">TESLİM ET</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <h3 className="text-white font-black text-lg mb-4">Yeni Gelen Sınavlar</h3>
                    <div className="space-y-4">
                      {exams.map(exm => (
                        <a key={exm.id} href={exm.url} target="_blank" rel="noreferrer" className="block p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-amber-500 transition-all group">
                          <p className="text-white font-bold text-sm mb-1">{exm.title}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 text-[10px] font-bold">{exm.deadline}</span>
                            <span className="text-amber-500 text-[10px] font-black group-hover:translate-x-1 transition-transform flex items-center gap-1">KATIL <ChevronRight size={10} /></span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {studentTab === 'docs' && (
              <div className="space-y-8">
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-bold hover:bg-purple-600 hover:text-white transition-all">{cat}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map(doc => (
                    <div key={doc.id} className="bg-slate-900/50 border border-slate-900 rounded-3xl p-6 hover:bg-slate-900 transition-all group">
                      <div className="p-4 bg-slate-950 rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
                        {doc.type === 'video' ? <Video className="text-red-500" /> : <FileDown className="text-purple-500" />}
                      </div>
                      <h3 className="text-white font-bold mb-1">{doc.title}</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase mb-6 tracking-widest">{doc.category}</p>
                      <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl transition-all">
                        {doc.type === 'video' ? 'İZLEMEYE BAŞLA' : 'DOSYAYI İNDİR'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {studentTab === 'calendar' && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  {events
                    .filter(e => e.studentId === 'all' || e.studentId === currentStudentUser?.id) // UPDATED: Filter for specific student
                    .map((event) => (
                    <div key={event.id} className="bg-slate-900/50 border border-slate-900 rounded-3xl p-6 flex items-center gap-6">
                      <div className="w-16 h-16 bg-purple-600 rounded-2xl flex flex-col items-center justify-center text-white">
                        <span className="text-[10px] font-black uppercase">{new Date(event.date).toLocaleDateString('tr-TR', { month: 'short' })}</span>
                        <span className="text-xl font-black">{new Date(event.date).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-black text-lg">{event.title}</h4>
                        <p className="text-slate-500 text-sm">{event.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-black text-xl">{event.time}</p>
                        <button className="text-purple-500 text-xs font-bold hover:underline">Hata Bildir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  };

  // --- MAIN RENDER ---
  if (!userRole) return <RoleSelector />;

  if (userRole === 'student') return <StudentLayout />;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <TeacherSidebar />
      
      <main className="flex-1 lg:ml-72 p-4 lg:p-10">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <TeacherDashboard />}
          {activeTab === 'students' && <TeacherStudents />}
          {activeTab === 'docs' && <TeacherDocs />}
          {activeTab === 'assignments' && <TeacherAssignments />}
          {activeTab === 'calendar' && <TeacherCalendar />}
          {activeTab === 'analytics' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="p-6 bg-slate-900 rounded-full mb-6">
                <PieChart size={64} className="text-blue-500" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Analiz Modülü Hazırlanıyor</h2>
              <p className="text-slate-500 max-w-sm">Öğrenci gelişim verileri AI tarafından işleniyor. Çok yakında burada detaylı raporlar göreceksiniz.</p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed bottom-6 right-6 z-[60] lg:hidden p-4 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-900/40"
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>
    </div>
  );
};

export default App;
