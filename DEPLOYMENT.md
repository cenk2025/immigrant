# WorkLife IQ Finland - Deployment Guide

## 🚀 **Supabase Kurulumu**

### 1. Veritabanı Tablolarını Oluştur

1. [Supabase Dashboard](https://app.supabase.com/project/rrkfwshzcxcnwhmusuhd)'a git
2. Sol menüden **SQL Editor**'ü aç
3. `supabase-schema.sql` dosyasındaki tüm SQL kodunu kopyala
4. SQL Editor'e yapıştır ve **RUN** butonuna tıkla

Bu işlem şu tabloları oluşturacak:
- `profiles` - Kullanıcı profilleri
- `cv_versions` - CV verileri
- `chat_messages` - Sohbet geçmişi
- `saved_guide_sections` - Kaydedilen kılavuz bölümleri

### 2. Email Confirmation Ayarını Kapat

**ÖNEMLİ**: Supabase varsayılan olarak email confirmation gerektirir. Test için bunu kapatmalısınız:

1. Supabase Dashboard'da **Authentication** > **Providers** > **Email**'e git
2. **"Confirm email"** ayarını **KAPALI** yap
3. **Save** butonuna tıkla

### 3. Email Template Ayarları (Opsiyonel)

Eğer email confirmation'ı açık tutmak isterseniz:
1. **Authentication** > **Email Templates**'e git
2. **Confirm signup** template'ini düzenle
3. Confirmation URL'ini ayarla

## 📦 **GitHub'a Yükleme**

```bash
cd /Users/cenkyakinlar/.gemini/antigravity/scratch/worklife-iq-finland

# Git repository'yi başlat
git init

# .gitignore dosyası zaten var, .env dosyası ignore edilecek

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: WorkLife IQ Finland - Production Ready"

# Remote repository ekle
git remote add origin https://github.com/cenk2025/immigrant.git

# Push et
git branch -M main
git push -u origin main
```

## 🌐 **Vercel Deployment**

### 1. Vercel'e Bağlan

1. [Vercel Dashboard](https://vercel.com)'a git
2. **Add New Project** tıkla
3. GitHub repository'yi seç: `cenk2025/immigrant`
4. **Import** tıkla

### 2. Environment Variables Ekle

Build Settings'de şu environment variable'ları ekle:

```
VITE_SUPABASE_URL=https://rrkfwshzcxcnwhmusuhd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJya2Z3c2h6Y3hjbndobXVzdWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMTExODksImV4cCI6MjA4MTc4NzE4OX0.AHbIie6aPRI430OffYokfeXJ1po6YztiuzQingj_NF4
VITE_DEEPSEEK_API_KEY=sk-5fba3c36074349d3a2715d6e5860cd89
```

### 3. Deploy

1. **Deploy** butonuna tıkla
2. Build tamamlanana kadar bekle (yaklaşık 1-2 dakika)
3. Deployment URL'ini al

### 4. Custom Domain Ayarla

1. Vercel Dashboard'da **Settings** > **Domains**'e git
2. `worklife.voon.fi` domain'ini ekle
3. DNS ayarlarını yap:
   - Type: `CNAME`
   - Name: `worklife`
   - Value: `cname.vercel-dns.com`

## ✅ **Test Etme**

### Lokal Test

```bash
npm run dev
```

Tarayıcıda: http://localhost:5175

### Production Test

1. Vercel deployment URL'ini aç
2. **Sign Up** ile yeni hesap oluştur
3. Dashboard'a yönlendirilmelisiniz
4. CV Builder'ı test et
5. AI Assistant'ı test et

## 🔧 **Sorun Giderme**

### Email Confirmation Hatası

Eğer "Email not confirmed" hatası alıyorsanız:

**Çözüm 1**: Email confirmation'ı kapat (yukarıda anlatıldı)

**Çözüm 2**: Supabase'den gelen confirmation email'ini kontrol et

### 400 Bad Request Hatası

Eğer signup/login sırasında 400 hatası alıyorsanız:

1. Supabase Dashboard > **Authentication** > **URL Configuration**'a git
2. **Site URL** ayarını kontrol et:
   - Development: `http://localhost:5175`
   - Production: `https://worklife.voon.fi`
3. **Redirect URLs** listesine ekle:
   - `http://localhost:5175/**`
   - `https://worklife.voon.fi/**`

### Build Hatası

Eğer Vercel'de build hatası alıyorsanız:

```bash
# Lokal olarak test et
npm run build

# Hataları düzelt
npm run dev
```

## 📊 **Monitoring**

### Supabase Dashboard

- **Authentication** > **Users**: Kayıtlı kullanıcıları gör
- **Table Editor**: Veritabanı verilerini gör
- **Database** > **Logs**: SQL loglarını kontrol et

### Vercel Dashboard

- **Deployments**: Deployment geçmişi
- **Analytics**: Trafik istatistikleri
- **Logs**: Runtime logları

## 🎯 **Sonraki Adımlar**

1. ✅ Supabase tablolarını oluştur
2. ✅ Email confirmation'ı kapat
3. ✅ GitHub'a push et
4. ✅ Vercel'e deploy et
5. ✅ Custom domain ayarla
6. ✅ Test et

## 📞 **Destek**

Herhangi bir sorun yaşarsanız:
- Supabase Logs: Veritabanı hataları için
- Vercel Logs: Deployment hataları için
- Browser Console: Frontend hataları için

---

**Başarılar! 🚀**
