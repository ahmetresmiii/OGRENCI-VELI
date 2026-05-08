import React, { useState, useEffect } from 'react';
import { 
  UserPlus, FileText, Calendar, Clock, Trash2, ExternalLink, GraduationCap, Layers, Video, 
  FileCheck, ClipboardList, TrendingUp, Sparkles, LogOut, Check, ArrowRight, CalendarDays,
  FileSpreadsheet, Shield, Users, MonitorPlay, Heart, Lock, AlertTriangle, BarChart3, 
  ChevronDown, ChevronUp, FileUp, Award, Target, BookOpen, PenLine, Save, X
} from 'lucide-react';

// FIREBASE BAĞLANTISI
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  setDoc
} from 'firebase/firestore';

// --- VERİ TİPLERİ ---
interface Student {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  avatarSeed: string;
  createdAt: string;
  teacherNotes?: string;
}

interface ExamResult {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  date: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  recordingUrl?: string;
}

function App() {
  // --- STATE TANIMLAMALARI ---
  const [students, setStudents] = useState<Student[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  
  const [userRole, setUserRole] = useState<'guest' | 'teacher' | 'student' | 'parent'>('guest');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [teacherPassInput, setTeacherPassInput] = useState('');

  // --- FİREBASE'DEN VERİLERİ ÇEKME (GERÇEK ZAMANLI) ---
  useEffect(() => {
    // Öğrencileri çek
    const unsubscribeStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      const studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentData);
    });

    // Sınav sonuçlarını çek
    const unsubscribeExams = onSnapshot(query(collection(db, "exams"), orderBy("date", "desc")), (snapshot) => {
      const examData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult));
      setExamResults(examData);
    });

    // Etkinlikleri/Dersleri çek
    const unsubscribeEvents = onSnapshot(query(collection(db, "events"), orderBy("date", "asc")), (snapshot) => {
      const eventData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventData);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeExams();
      unsubscribeEvents();
    };
  }, []);

  // --- ÖĞRETMEN İŞLEMLERİ (FİREBASE'E KAYDETME) ---
  const addStudent = async (name: string, user: string, pass: string) => {
    try {
      await addDoc(collection(db, "students"), {
        name,
        username: user,
        passwordHash: pass,
        avatarSeed: Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString()
      });
    } catch (e) { console.error("Öğrenci eklenemedi: ", e); }
  };

  const addExam = async (studentId: string, subject: string, score: number) => {
    try {
      await addDoc(collection(db, "exams"), {
        studentId,
        subject,
        score,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (e) { console.error("Sınav eklenemedi: ", e); }
  };

  const addEvent = async (title: string, desc: string, date: string, time: string) => {
    try {
      await addDoc(collection(db, "events"), {
        title,
        description: desc,
        date,
        time
      });
    } catch (e) { console.error("Ders eklenemedi: ", e); }
  };

  const deleteItem = async (col: string, id: string) => {
    try {
      await deleteDoc(doc(db, col, id));
    } catch (e) { console.error("Silme hatası: ", e); }
  };

  // --- GİRİŞ MANTIĞI ---
  const handleLogin = () => {
    if (loginUsername === 'admin' && loginPassword === 'A123') {
      setUserRole('teacher');
      return;
    }
    const student = students.find(s => s.username === loginUsername && s.passwordHash === loginPassword);
    if (student) {
      setUserRole('student');
      setCurrentUser(student);
    } else {
      alert("Hatalı kullanıcı adı veya şifre!");
    }
  };

  // --- ARAYÜZ (TASARIM AYNI KALDI) ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      {/* ÜST MENÜ */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg"><GraduationCap className="text-white h-6 w-6" /></div>
            <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">DERSLINK</span>
          </div>
          {userRole !== 'guest' && (
            <button onClick={() => setUserRole('guest')} className="flex items-center space-x-2 bg-slate-800 hover:bg-red-900/30 px-4 py-2 rounded-full transition-all border border-slate-700">
              <LogOut className="h-4 w-4" /> <span>Çıkış Yap</span>
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {userRole === 'guest' ? (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl mt-20">
            <h2 className="text-2xl font-bold text-center mb-6">Sisteme Giriş Yap</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Kullanıcı Adı" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
              <input type="password" placeholder="Şifre" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
              <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20">Giriş Yap</button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ÖĞRETMEN PANELİ ÖZETİ */}
            {userRole === 'teacher' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-slate-400 text-sm font-bold flex items-center"><Users className="h-4 w-4 mr-2" /> Toplam Öğrenci</h3>
                  <p className="text-3xl font-black mt-2">{students.length}</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-slate-400 text-sm font-bold flex items-center"><CalendarDays className="h-4 w-4 mr-2" /> Bekleyen Dersler</h3>
                  <p className="text-3xl font-black mt-2">{events.length}</p>
                </div>
                <button onClick={() => {
                  const n = prompt("Öğrenci Adı:");
                  const u = prompt("Kullanıcı Adı:");
                  const p = prompt("Şifre:");
                  if(n && u && p) addStudent(n, u, p);
                }} className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 p-6 rounded-2xl flex flex-col items-center justify-center transition-all group">
                  <UserPlus className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="mt-2 font-bold text-blue-400">Yeni Öğrenci Ekle</span>
                </button>
              </div>
            )}

            {/* DERS PROGRAMI / ETKİNLİKLER */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center"><Clock className="mr-2 text-blue-500" /> Yaklaşan Canlı Dersler</h3>
                {userRole === 'teacher' && (
                  <button onClick={() => addEvent("Yeni Ders", "Ders içeriği buraya", "2026-05-10", "19:00")} className="text-xs bg-slate-800 px-3 py-1 rounded-lg hover:bg-slate-700">Ders Ekle</button>
                )}
              </div>
              <div className="p-6 grid gap-4">
                {events.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div>
                      <div className="text-blue-400 text-xs font-bold uppercase">{ev.date} - {ev.time}</div>
                      <div className="font-bold text-slate-100">{ev.title}</div>
                      <div className="text-sm text-slate-400">{ev.description}</div>
                    </div>
                    {userRole === 'teacher' && (
                      <button onClick={() => deleteItem("events", ev.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ÖĞRENCİ LİSTESİ VE NOTLAR (SADECE ÖĞRETMEN) */}
            {userRole === 'teacher' && (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center"><FileText className="mr-2 text-amber-500" /> Sınav Sonuçları Girişi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
                        <th className="pb-3">Öğrenci</th>
                        <th className="pb-3">Sonuçlar</th>
                        <th className="pb-3">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {students.map(s => (
                        <tr key={s.id}>
                          <td className="py-4 font-bold">{s.name}</td>
                          <td className="py-4">
                            {examResults.filter(e => e.studentId === s.id).map(r => (
                              <span key={r.id} className="inline-block bg-slate-800 px-2 py-1 rounded mr-2 text-xs">
                                {r.subject}: {r.score}
                              </span>
                            ))}
                          </td>
                          <td className="py-4">
                            <button onClick={() => addExam(s.id, "Matematik", 95)} className="text-xs text-blue-400 hover:underline">Puan Ekle</button>
                            <button onClick={() => deleteItem("students", s.id)} className="ml-4 text-xs text-red-500 hover:underline">Sil</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ÖĞRENCİ ÖZEL PANELİ */}
            {userRole === 'student' && currentUser && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl">
                <h2 className="text-3xl font-black">Hoş Geldin, {currentUser.name}! 👋</h2>
                <p className="mt-2 opacity-90">Senin için hazırlanan ders programı ve sınav sonuçları aşağıdadır.</p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur">
                    <div className="text-xs font-bold uppercase opacity-70">Başarı Puanın</div>
                    <div className="text-2xl font-black">
                      {examResults.filter(e => e.studentId === currentUser.id).length > 0 
                        ? (examResults.filter(e => e.studentId === currentUser.id).reduce((a,b) => a + b.score, 0) / examResults.filter(e => e.studentId === currentUser.id).length).toFixed(1)
                        : "0"}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur">
                    <div className="text-xs font-bold uppercase opacity-70">Bekleyen Ödev</div>
                    <div className="text-2xl font-black">3</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-800 py-8 text-center text-slate-500 text-xs">
        <p>© 2026 DersLink — Tüm veriler bulut üzerinde güvenle saklanmaktadır.</p>
      </footer>
    </div>
  );
}

export default App;
