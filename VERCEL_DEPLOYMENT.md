# 🚀 Vercel Deployment Guide - WorkLife IQ Finland

## Hızlı Başlangıç

Bu rehber, WorkLife IQ Finland uygulamasını Vercel'e deploy etmek için adım adım talimatlar içerir.

---

## 📋 Ön Gereksinimler

✅ GitHub repository hazır: https://github.com/cenk2025/immigrant
✅ Supabase projesi oluşturulmuş
✅ DeepSeek API key'i mevcut
✅ Vercel hesabı (ücretsiz)

---

## 🔧 1. Supabase Kurulumu

### 1.1 Database Schema'yı Yükle

1. Supabase Dashboard'a git: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **SQL Editor**'ü açın
4. `supabase-schema.sql` dosyasının içeriğini kopyalayın
5. SQL Editor'e yapıştırın ve **Run** butonuna tıklayın

### 1.2 Email Confirmation'ı Devre Dışı Bırak

1. Sol menüden **Authentication** > **Providers** > **Email**
2. **Confirm email** seçeneğini **KAPATIN**
3. **Save** butonuna tıklayın

⚠️ **Önemli**: Bu ayar olmadan kullanıcılar giriş yapamaz!

### 1.3 API Keys'leri Kopyala

1. Sol menüden **Settings** > **API**
2. Şu bilgileri kopyalayın:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public** key (VITE_SUPABASE_ANON_KEY)

---

## 🌐 2. Vercel'e Deploy

### Yöntem 1: Vercel Dashboard (Önerilen)

#### Adım 1: Vercel'e Giriş Yap
1. https://vercel.com adresine git
2. **Sign Up** veya **Log In** yap
3. GitHub hesabınla bağlan

#### Adım 2: Yeni Proje Oluştur
1. Dashboard'da **Add New...** > **Project** tıkla
2. **Import Git Repository** bölümünde GitHub'ı seç
3. `cenk2025/immigrant` repository'sini bul
4. **Import** butonuna tıkla

#### Adım 3: Proje Ayarları
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### Adım 4: Environment Variables Ekle

**Environment Variables** bölümünde şu değişkenleri ekle:

| Key | Value | Nereden Alınır |
|-----|-------|----------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase > Settings > API |
| `VITE_DEEPSEEK_API_KEY` | `sk-...` | DeepSeek Dashboard |

**Örnek:**
```
VITE_SUPABASE_URL=https://hqyzvyiqnsxhqzbihrxo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

#### Adım 5: Deploy!
1. **Deploy** butonuna tıkla
2. Build işleminin tamamlanmasını bekle (2-3 dakika)
3. ✅ Deployment başarılı olduğunda link göreceksiniz

---

### Yöntem 2: Vercel CLI (Alternatif)

```bash
# Vercel CLI'yi yükle
npm install -g vercel

# Vercel'e giriş yap
vercel login

# Deploy et
vercel

# Production'a deploy et
vercel --prod
```

---

## 🌍 3. Custom Domain Ayarları (worklife.voon.fi)

### Adım 1: Vercel'de Domain Ekle
1. Vercel Dashboard'da projenizi açın
2. **Settings** > **Domains** sekmesine git
3. **Add** butonuna tıkla
4. `worklife.voon.fi` yazın
5. **Add** butonuna tıkla

### Adım 2: DNS Ayarları
Vercel size DNS kayıtlarını gösterecek. Domain sağlayıcınızda (örn. Namecheap, GoDaddy) şu kayıtları ekleyin:

**A Record:**
```
Type: A
Name: worklife
Value: 76.76.21.21
```

**CNAME Record (Alternatif):**
```
Type: CNAME
Name: worklife
Value: cname.vercel-dns.com
```

### Adım 3: SSL Sertifikası
Vercel otomatik olarak SSL sertifikası oluşturacak (Let's Encrypt).
Bu işlem 10-30 dakika sürebilir.

---

## ✅ 4. Deployment Doğrulama

### Test Checklist

Deployment sonrası şu özellikleri test edin:

- [ ] Ana sayfa açılıyor
- [ ] Kayıt olma çalışıyor
- [ ] Giriş yapma çalışıyor
- [ ] CV Builder açılıyor
- [ ] Fotoğraf yükleme çalışıyor
- [ ] AI iyileştirme çalışıyor
- [ ] AI CV analizi çalışıyor
- [ ] Employer Guide açılıyor
- [ ] Dil değiştirme çalışıyor (EN/FI)
- [ ] Tema değiştirme çalışıyor (Light/Dark)
- [ ] Dashboard açılıyor
- [ ] Assistant çalışıyor

### Test Kullanıcısı

Giriş bilgileri:
```
Email: cenk.yakinlar@hotmail.com
Password: tibetuma2025
```

---

## 🔍 5. Sorun Giderme

### Build Hatası
```bash
# Local'de build test et
npm run build

# Hata varsa düzelt ve tekrar push et
git add .
git commit -m "fix: build error"
git push origin main
```

### Environment Variables Hatası
1. Vercel Dashboard > Settings > Environment Variables
2. Tüm değişkenlerin doğru olduğundan emin ol
3. **Redeploy** butonuna tıkla

### Supabase Bağlantı Hatası
1. `.env` dosyasındaki değerleri kontrol et
2. Supabase URL'in `https://` ile başladığından emin ol
3. API key'in doğru kopyalandığından emin ol

### 404 Hatası (Routing)
`vercel.json` dosyası doğru yapılandırılmış mı kontrol et:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### AI Özellikleri Çalışmıyor
1. DeepSeek API key'in doğru olduğundan emin ol
2. Browser console'da hata var mı kontrol et
3. API quota'nızı kontrol edin

---

## 📊 6. Production Optimizasyonları

### Performance
- ✅ Vite otomatik code splitting yapıyor
- ✅ Assets minify ediliyor
- ✅ Gzip compression aktif

### SEO
`index.html` dosyasına meta tags eklenmiş:
```html
<meta name="description" content="WorkLife IQ Finland - Career Intelligence for Immigrants">
<meta property="og:title" content="WorkLife IQ Finland">
<meta property="og:description" content="Navigate your career in Finland with confidence">
```

### Analytics (Opsiyonel)
Vercel Analytics eklemek için:
1. Vercel Dashboard > Analytics sekmesi
2. **Enable Analytics** butonuna tıkla

---

## 🔄 7. Güncelleme Workflow

Kod değişikliklerini deploy etmek için:

```bash
# 1. Değişiklikleri yap
# 2. Test et
npm run dev

# 3. Build test et
npm run build

# 4. Commit ve push
git add .
git commit -m "feat: yeni özellik"
git push origin main

# 5. Vercel otomatik deploy eder! 🎉
```

---

## 📞 8. Destek

### Vercel Destek
- Dokümantasyon: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

### Supabase Destek
- Dokümantasyon: https://supabase.com/docs
- Discord: https://discord.supabase.com

### DeepSeek Destek
- Dokümantasyon: https://platform.deepseek.com/docs

---

## 🎉 Başarılı Deployment!

Uygulamanız şu adreslerde yayında:

- **Vercel URL**: `https://immigrant-xxx.vercel.app`
- **Custom Domain**: `https://worklife.voon.fi` (DNS propagation sonrası)

**Tebrikler! 🚀**

---

## 📝 Notlar

- Vercel ücretsiz planı:
  - ✅ Unlimited deployments
  - ✅ 100 GB bandwidth/month
  - ✅ Automatic HTTPS
  - ✅ Custom domains
  
- Production checklist:
  - [ ] Supabase RLS policies aktif
  - [ ] Environment variables güvenli
  - [ ] Error tracking kurulu (opsiyonel)
  - [ ] Analytics aktif (opsiyonel)
  - [ ] Custom domain bağlı
  - [ ] SSL sertifikası aktif

---

**Son Güncelleme**: 2025-12-20
**Versiyon**: 1.0.0
