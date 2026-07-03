// src/telegram.ts

export const sendTelegramNotification = async (ogrenciAdi: string, odevBasligi: string) => {
  const botToken = "8820072053:AAGPpog5NkKyygti1OYlA1pj3dfdLdUiPBA";
  const chatId = "SENIN_CHAT_ID_BURAYA"; // Kendi Telegram Chat ID'ni yaz
  
  const mesaj = `🔔 *Ödev Tamamlandı!*\n\n👤 *Öğrenci:* ${ogrenciAdi}\n📚 *Ödev:* ${odevBasligi}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: mesaj,
        parse_mode: "Markdown",
      }),
    });

    if (!response.ok) {
      console.error("Telegram API hatası:", response.statusText);
    }
  } catch (error) {
    console.error("Telegram bildirimi gönderilemedi:", error);
  }
};
