import { Telegraf } from 'telegraf';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import express from 'express';

// --- RENDER PORT BAĞLAMA (SAHTE WEB SUNUCU) ---
const expressApp = express();
const PORT = process.env.PORT || 10000;
expressApp.get('/', (req, res) => res.send('Bot aktif ve çalışıyor!'));
expressApp.listen(PORT, () => console.log(`🌍 Render için port dinleniyor: ${PORT}`));

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
const GEMINI_API_KEY = 'AQ.Ab8RN6LNIct3oaWXcTka0EaICXf7aOUFTODc6XBXycKDEI8HdA'.trim();

// Başlatmalar
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// --- CANLI VERİ BAĞLAMI OLUŞTURUCU ---
async function getSystemContext() {
  try {
    const studentSnap = await getDocs(collection(db, "students"));
    const students = [];
    studentSnap.forEach(doc => students.push(doc.data()));

    const assignQuery = query(collection(db, "assignments"), orderBy("submittedAt", "desc"), limit(5));
    const assignSnap = await getDocs(assignQuery);
    const recentAssignments = [];
    assignSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'Tamamlandı') {
        recentAssignments.push(data);
      }
    });

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

// --- GOOGLE STANDARTLARINDA DOĞRUDAN FETCH İSTEĞİ ---
async function askGeminiDirect(systemPrompt, userMessage) {
  // Anahtarı hem URL parametresi olarak ekliyoruz hem de en kararlı endpoint'i kullanıyoruz
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\nKullanıcıdan Gelen Soru: ${userMessage}` }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini HTTP Hatası: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error("Gemini beklendiği gibi bir yanıt döndürmedi.");
  }
}

// --- BOT MESAJ İŞLEME MANTIĞI ---
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  const liveSystemData = await getSystemContext();

  try {
    const systemPrompt = `
      Sen Sınıfım360 platformunun akıllı eğitim asistanısın. Kullanıcı (Öğretmen) sana sorular soracak.
      Aşağıda platformdan gelen anlık, canlı veriler yer almaktadır. Bu verilere göre sorulan sorulara net, samimi, öz ve doğru cevaplar vermelisin.
      Eğer veride aranan bilgi yoksa veya genel bir şey soruluyorsa kibar bir şekilde asistan gibi sohbet et.

      Canlı Sistem Verileri:
      ${liveSystemData}
    `;

    const responseText = await askGeminiDirect(systemPrompt, userMessage);
    await ctx.reply(responseText);
  } catch (error) {
    console.error("Detaylı Hata Çıktısı:", error);
    await ctx.reply("🤖 Üzgünüm hocam, yapay zeka motoruyla konuşurken küçük bir teknik aksaklık yaşandı.");
  }
});

// Botu Başlat
bot.launch().then(() => {
  console.log("🚀 Sınıfım360 Akıllı AI Asistan Botu başarıyla başlatıldı ve dinliyor...");
});
