import { Telegraf } from 'telegraf';
import { GoogleGenAI } from '@google/generative-ai';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// --- VERİTABANI YAPILANDIRMASI ---
const firebaseConfig = {
  apiKey: "AIzaSyBqxSvtSrKLjb-0Yq91abjXhqPy8JIbSJs",
  authDomain: "veliogrenci-cce71.firebaseapp.com",
  projectId: "veliogrenci-cce71",
  storageBucket: "veliogrenci-cce71.firebasestorage.app",
  messagingSenderId: "1092640766125",
  appId: "1:1092640766125:web:c3b7c7dc99606515946e24"
};

// Bot ve AI Kimlik Bilgileri
const TELEGRAM_BOT_TOKEN = '8903876036:AAEDESUha3MUDfkJKUSJQ5OQDqlNqREn39s';
const GEMINI_API_KEY = 'AQ.Ab8RN6KWrexCBRxT8niYrY759I0gQOZkw2AaDFG6ffD5GTyIaw';

// Başlatmalar
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// --- CANLI VERİ BAĞLAMI OLUŞTURUCU ---
async function getSystemContext() {
  try {
    // 1. Öğrencileri Al
    const studentSnap = await getDocs(collection(db, "students"));
    const students = [];
    studentSnap.forEach(doc => students.push(doc.data()));

    // 2. Son Tamamlanan Ödevleri Al
    const assignQuery = query(collection(db, "assignments"), orderBy("submittedAt", "desc"), limit(5));
    const assignSnap = await getDocs(assignQuery);
    const recentAssignments = [];
    assignSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'Tamamlandı') {
        recentAssignments.push(data);
      }
    });

    // Verileri yapay zekanın anlayacağı metin formatına getiriyoruz
    let context = "Sistemdeki Güncel Öğrenci Durumları:\n";
    students.forEach(s => {
      context += `- Öğrenci Adı: ${s.name}, Kullanıcı Adı: ${s.username}, Son Giriş Tarihi: ${s.lastLogin || 'Henüz giriş yapmadı'}, Öğretmen Notu: ${s.teacherNotes || 'Not yok'}\n`;
    });

    context += "\nSon Tamamlanan Ödevler:\n";
    if (recentAssignments.length === 0) {
      context += "- Henüz yakın zamanda tamamlanan ödev yok.\n";
    } else {
      recentAssignments.forEach(a => {
        const studentName = students.find(s => s.id === a.studentId)?.name || "Bilinmeyen Öğrenci";
        context += `- Öğrenci: ${studentName}, Ödev Başlığı: ${a.title}, Teslim Tarihi: ${a.submittedAt || 'Belirtilmemiş'}\n`;
      });
    }

    return context;
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return "Sistem verilerine şu an ulaşılamıyor.";
  }
}

// --- BOT MESAJ İŞLEME MANTIĞI ---
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  
  // Anlık olarak Firebase'den canlı verileri çekiyoruz
  const liveSystemData = await getSystemContext();

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const systemPrompt = `
      Sen Sınıfım360 platformunun akıllı eğitim asistanısın. Kullanıcı (Öğretmen) sana sorular soracak.
      Aşağıda platformdan gelen anlık, canlı veriler yer almaktadır. Bu verilere göre sorulan sorulara net, samimi, öz ve doğru cevaplar vermelisin.
      Eğer veride aranan bilgi yoksa veya genel bir şey soruluyorsa (örneğin merhaba deniyorsa) kibar bir şekilde asistan gibi sohbet et.

      Canlı Sistem Verileri:
      ${liveSystemData}
    `;

    const result = await model.generateContent([systemPrompt, userMessage]);
    const responseText = result.response.text();

    await ctx.reply(responseText);
  } catch (error) {
    console.error("Gemini AI Hatası:", error);
    await ctx.reply("🤖 Üzgünüm hocam, yapay zeka motoruyla konuşurken küçük bir teknik aksaklık yaşandı.");
  }
});

// Botu Başlat
bot.launch().then(() => {
  console.log("🚀 Sınıfım360 Akıllı AI Asistan Botu başarıyla başlatıldı ve dinliyor...");
});
