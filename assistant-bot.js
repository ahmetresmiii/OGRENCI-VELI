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

// Bot ve OpenRouter Kimlik Bilgileri
const TELEGRAM_BOT_TOKEN = '8903876036:AAEDESUha3MUDfkJKUSJQ5OQDqlNqREn39s';
const OPENROUTER_API_KEY = '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'.trim();

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

// --- OPENROUTER API FETCH İSTEĞİ ---
async function askOpenRouter(systemPrompt, userMessage) {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://ogrenci-veli.onrender.com',
      'X-Title': 'Sınıfım360 Bot'
    },
    body: JSON.stringify({
      model: 'openrouter/auto', // İstediğin otomatik model seçimi aktif edildi
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  } else {
    throw new Error("OpenRouter geçerli bir yanıt döndürmedi.");
  }
}

// --- BOT MESAJ İŞLEME MANTIĞI ---
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  
  try {
    const liveSystemData = await getSystemContext();
    const systemPrompt = `
      Sen Sınıfım360 platformunun akıllı eğitim asistanısın. Kullanıcı (Öğretmen) sana sorular soracak.
      Aşağıda platformdan gelen anlık, canlı veriler yer almaktadır. Bu verilere göre sorulan sorulara net, samimi, öz ve doğru cevaplar vermelisin.

      Canlı Sistem Verileri:
      ${liveSystemData}
    `;

    const responseText = await askOpenRouter(systemPrompt, userMessage);
    await ctx.reply(responseText);
  } catch (error) {
    console.error("Detaylı Hata Çıktısı:", error);
    await ctx.reply(`🤖 Teknik Hata Detayı:\n${error.message}`);
  }
});

// Botu Başlat
bot.launch().then(() => {
  console.log("🚀 Sınıfım360 Akıllı AI Asistan Botu başarıyla başlatıldı.");
});
