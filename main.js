    /* ===== الوضع الداكن ===== */
    (function applyTheme() {
      const dark = localStorage.getItem('salma-theme') === 'dark';
      if (dark) {
        document.body.classList.add('dark-mode');
        document.getElementById('themeIcon').className = 'fas fa-sun';
      }
    })();
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('salma-theme', isDark ? 'dark' : 'light');
      themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    });

    /* ===== فتح/إغلاق القائمة الجانبية ===== */
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    function toggleSidebar() {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    }
    menuToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) toggleSidebar();
    });

    /* ===== التنقل بين الصفحات ===== */
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.sidebar-item[data-page]');
    function showPage(pageId) {
      pages.forEach(p => p.classList.remove('active'));
      const target = document.getElementById('page-' + pageId);
      if (target) target.classList.add('active');
      if (sidebar.classList.contains('open')) toggleSidebar();
    }
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) showPage(page);
      });
    });
    // عرض الصفحة الرئيسية افتراضياً
    showPage('home');

    /* ===== إدارة المودالات ===== */
    function openModal(modalId) {
      document.getElementById(modalId).classList.add('active');
    }
    function closeModal(modalId) {
      document.getElementById(modalId).classList.remove('active');
    }

    // معلومات الموقع
    document.getElementById('openAboutBtn').addEventListener('click', () => openModal('aboutModal'));
    document.getElementById('aboutModalBg').addEventListener('click', () => closeModal('aboutModal'));
    document.getElementById('closeAboutBtn').addEventListener('click', () => closeModal('aboutModal'));

    // PWA
    function openPwaModal() { openModal('pwaModal'); }
    document.getElementById('pwaInstallBtn').addEventListener('click', openPwaModal);
    document.getElementById('pwaModalBg').addEventListener('click', () => closeModal('pwaModal'));
    document.getElementById('pwaModalClose').addEventListener('click', () => closeModal('pwaModal'));

    // إغلاق المودالات بالـ Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ['aboutModal', 'pwaModal'].forEach(id => {
          if (document.getElementById(id).classList.contains('active')) closeModal(id);
        });
      }
    });

    /* ===== PWA: تفعيل زر التثبيت (beforeinstallprompt) ===== */
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('PWA ready to install');
    });

    // زر التثبيت في القائمة
    document.getElementById('pwaInstallBtn').addEventListener('click', function() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('تم تثبيت التطبيق');
          } else {
            console.log('تم رفض التثبيت');
          }
          deferredPrompt = null;
        });
      } else {
        openPwaModal();
      }
    });

    // زر "فهمت" في مودال PWA يحاول التثبيت إن أمكن
    const pwaModalClose = document.getElementById('pwaModalClose');
    pwaModalClose.addEventListener('click', function() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('تم تثبيت التطبيق');
          }
          deferredPrompt = null;
        });
      }
      closeModal('pwaModal');
    });

    /* ===== تسجيل الخروج ===== */
    document.getElementById('logoutBtn').addEventListener('click', function() {
      if (confirm('هل تريد تسجيل الخروج؟')) {
        // حذف أي بيانات جلسة إن وجدت
        // التوجيه إلى صفحة تسجيل الدخول
        window.location.href = 'index.html';
      }
    });
    
    
    
// ================================================================
// 1. العداد الزمني من تاريخ محدد (دقيق جداً)
// ================================================================

// تاريخ البداية: 1 فبراير 2020 (الشهر في JS يبدأ من 0)
// الصيغة: (السنة, الشهر-1, اليوم, الساعة, الدقيقة, الثانية)
const START_DATE = new Date(2020, 1, 1, 0, 0, 0); // 1/2/2020

// عناصر العداد
const yearsEl = document.getElementById('years');
const monthsEl = document.getElementById('months');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

// متغير لتتبع الثواني السابقة لإصدار الصوت عند تغير الدقيقة
let prevSeconds = 0;

// ================================================================
// دالة حساب الفرق بين تاريخين بدقة (تراعي السنوات الكبيسة وأطوال الأشهر)
// ================================================================
function getDateDifference(start, end) {
    // نسخ التواريخ لتجنب التعديل على الأصل
    let startDate = new Date(start);
    let endDate = new Date(end);

    // استخراج المكونات
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();
    let hours = endDate.getHours() - startDate.getHours();
    let minutes = endDate.getMinutes() - startDate.getMinutes();
    let seconds = endDate.getSeconds() - startDate.getSeconds();

    // ===== تصحيح القيم السالبة (من الأصغر إلى الأكبر) =====
    
    // تصحيح الثواني
    if (seconds < 0) {
        seconds += 60;
        minutes--;
    }
    
    // تصحيح الدقائق
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    
    // تصحيح الساعات
    if (hours < 0) {
        hours += 24;
        days--;
    }
    
    // تصحيح الأيام (نحتاج لمعرفة عدد أيام الشهر السابق)
    if (days < 0) {
        // الشهر الحالي في endDate (قبل التصحيح)
        const currentMonth = endDate.getMonth();
        const currentYear = endDate.getFullYear();
        // عدد أيام الشهر السابق (الشهر الذي يسبق currentMonth)
        const prevMonth = currentMonth - 1;
        const yearForPrevMonth = prevMonth < 0 ? currentYear - 1 : currentYear;
        const monthForPrevMonth = prevMonth < 0 ? 11 : prevMonth;
        const daysInPrevMonth = new Date(yearForPrevMonth, monthForPrevMonth + 1, 0).getDate();
        days += daysInPrevMonth;
        months--;
    }
    
    // تصحيح الأشهر
    if (months < 0) {
        months += 12;
        years--;
    }

    return { years, months, days, hours, minutes, seconds };
}

// ================================================================
// دالة تحديث العداد
// ================================================================
function updateCounter() {
    const now = new Date();
    const diff = getDateDifference(START_DATE, now);

    // تحديث العناصر
    yearsEl.textContent = diff.years;
    monthsEl.textContent = diff.months;
    daysEl.textContent = diff.days;
    hoursEl.textContent = String(diff.hours).padStart(2, '0');
    minutesEl.textContent = String(diff.minutes).padStart(2, '0');
    secondsEl.textContent = String(diff.seconds).padStart(2, '0');

    // إصدار صوت عند كل دقيقة (عندما تصل الثواني إلى 0)
    if (prevSeconds !== 0 && diff.seconds === 0) {
        playBeep();
    }
    prevSeconds = diff.seconds;
}

// ================================================================
// 2. صوت المنبه (باستخدام Web Audio API)
// ================================================================

let audioCtx;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playBeep() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        // نغمة لطيفة (نغمتين متتاليتين)
        const frequencies = [880, 1100];
        frequencies.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const startTime = now + index * 0.12;
            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.28);
        });
    } catch (e) {
        console.log('صوت المنبه غير متاح');
    }
}

// ================================================================
// 3. التاريخ الهجري والميلادي
// ================================================================

// ================================================================
// 3. التاريخ الهجري والميلادي
// ================================================================

function updateDates() {
    const now = new Date();
    
    // التاريخ الميلادي (كما هو بدون تغيير)
    const greg = now.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('gregorianDate').textContent = greg;
    
    // التاريخ الهجري التلقائي بدقة باستخدام Intl.DateTimeFormat (تقويم أم القرى)
    const hijri = now.toLocaleDateString('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    document.getElementById('hijriDate').textContent = hijri;
}

// ================================================================
// 4. أيام الصوم (الاثنين والخميس)
// ================================================================

function updateFastingDays() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=الأحد, 1=الاثنين, ..., 4=الخميس
    
    const isFastingDay = (dayOfWeek === 1 || dayOfWeek === 4);
    const fastingEl = document.getElementById('fastingDays');
    
    if (isFastingDay) {
        const dayName = dayOfWeek === 1 ? 'الاثنين' : 'الخميس';
        fastingEl.textContent = `🌙 اليوم ${dayName} - يوم صوم`;
        fastingEl.style.color = '#e98fb6';
    } else {
        // حساب اليوم القادم للصوم
        let daysUntil = 0;
        if (dayOfWeek < 1) daysUntil = 1 - dayOfWeek;
        else if (dayOfWeek < 4) daysUntil = 4 - dayOfWeek;
        else if (dayOfWeek === 5) daysUntil = 3;
        else if (dayOfWeek === 6) daysUntil = 2;
        
        if (daysUntil === 0) {
            fastingEl.textContent = '🍃 اليوم خميس - يوم صوم';
        } else {
            const nextDay = (dayOfWeek + daysUntil) % 7;
            const dayName = nextDay === 1 ? 'الاثنين' : 'الخميس';
            fastingEl.textContent = `⏳ بعد ${daysUntil} يوم (${dayName})`;
            fastingEl.style.color = '#a9718f';
        }
    }
}

// ================================================================
// 5. مودال تكبير الشهادة
// ================================================================

const modal = document.getElementById('certificateModal');
const modalBg = document.getElementById('certificateModalBg');
const modalClose = document.getElementById('certificateModalClose');
const trigger = document.getElementById('certificateTrigger');

function openCertificateModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCertificateModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

trigger.addEventListener('click', openCertificateModal);
modalBg.addEventListener('click', closeCertificateModal);
modalClose.addEventListener('click', closeCertificateModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeCertificateModal();
    }
});

// ================================================================
// 6. تشغيل كل الوظائف
// ================================================================

// تحديث العداد كل ثانية
setInterval(() => {
    updateCounter();
    updateDates();
    updateFastingDays();
}, 1000);

// تشغيل فوري عند تحميل الصفحة
updateCounter();
updateDates();
updateFastingDays();

console.log('✅ الصفحة الرئيسية جاهزة مع العداد الدقيق والتاريخ والصوم');
console.log(`📅 تاريخ البداية: ${START_DATE.toLocaleDateString('ar-EG')}`);





// ================================================================
// مشغل الموسيقى الثابت
// ================================================================

const audio = document.getElementById('musicAudio');
const playBtn = document.getElementById('musicPlayBtn');
const playIcon = document.getElementById('musicPlayIcon');
const prevBtn = document.getElementById('musicPrevBtn');
const nextBtn = document.getElementById('musicNextBtn');
const progressFill = document.getElementById('musicProgressFill');
const progressBar = document.getElementById('musicProgressBar');
const currentTimeEl = document.getElementById('musicCurrentTime');
const durationEl = document.getElementById('musicDuration');
const lyricsBox = document.getElementById('musicLyricsBox');

// بيانات الكلمات (وقت بالثانية + النص) - عدّليها براحتك على حسب أغنيتك
const lyricsData = [
  { time: 0,  text: 'طلي هلي' },
  { time: 3,  text: 'يا قمر الزمان' },
  { time: 6.9,  text: ' لو رحتي بضلي  و بعيوني كمان' },
  { time: 12, text: ' وعشفافي أسمك يا حبي  ' },
  { time: 15, text: ' بيغرد عشقان علي بالي بتبقي عالبالي ' },
  { time: 21, text: '  ي أجمل إنسان  ' }
];

let isPlaying = false;
let isDragging = false;
let animationId = null;
let currentLyricIndex = -1;
let currentLyricEl = null;

function formatTime(s) {
  if (isNaN(s) || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function updateProgress(time) {
  if (!audio.duration || isNaN(audio.duration)) return;
  progressFill.style.width = Math.min(100, (time / audio.duration) * 100) + '%';
  currentTimeEl.textContent = formatTime(time);
}

function updateLyric(time) {
  let idx = -1;
  for (let i = 0; i < lyricsData.length; i++) {
    const t = lyricsData[i].time;
    const next = i < lyricsData.length - 1 ? lyricsData[i + 1].time : Infinity;
    if (time >= t && time < next) { idx = i; break; }
  }
  if (idx === currentLyricIndex) return;
  currentLyricIndex = idx;

  // إخفاء السطر الحالي للأسفل
  if (currentLyricEl) {
    const oldEl = currentLyricEl;
    oldEl.classList.remove('enter');
    oldEl.classList.add('leave');
    setTimeout(() => oldEl.remove(), 450);
  }

  // إنزال السطر الجديد من فوق
  if (idx >= 0) {
    const div = document.createElement('div');
    div.className = 'lyric-line';
    div.textContent = lyricsData[idx].text;
    lyricsBox.appendChild(div);
    currentLyricEl = div;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => div.classList.add('enter'));
    });
  } else {
    currentLyricEl = null;
  }
}

function togglePlay() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playIcon.className = 'fas fa-play';
    if (animationId) cancelAnimationFrame(animationId);
  } else {
    if (audio.currentTime >= (audio.duration || 0)) audio.currentTime = 0;
    audio.play();
    isPlaying = true;
    playIcon.className = 'fas fa-pause';
    updateLoop();
  }
}

function updateLoop() {
  if (!isPlaying || audio.paused) return;
  updateProgress(audio.currentTime);
  updateLyric(audio.currentTime);
  animationId = requestAnimationFrame(updateLoop);
}

audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
  updateProgress(0);
});

// عند إعادة اللف بسبب loop تتحدث الكلمات من جديد
audio.addEventListener('timeupdate', () => {
  if (!isDragging && audio.currentTime < 0.4) updateLyric(0);
});

playBtn.addEventListener('click', togglePlay);

prevBtn.addEventListener('click', () => {
  const t = Math.max(0, audio.currentTime - 10);
  audio.currentTime = t;
  updateProgress(t);
  updateLyric(t);
});

nextBtn.addEventListener('click', () => {
  const t = Math.min(audio.duration || 0, audio.currentTime + 10);
  audio.currentTime = t;
  updateProgress(t);
  updateLyric(t);
});

function setProgressFromEvent(clientX) {
  const rect = progressBar.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const t = percent * audio.duration;
  audio.currentTime = t;
  updateProgress(t);
  updateLyric(t);
}

progressBar.addEventListener('mousedown', (e) => {
  isDragging = true;
  setProgressFromEvent(e.clientX);
});
document.addEventListener('mousemove', (e) => { if (isDragging) setProgressFromEvent(e.clientX); });
document.addEventListener('mouseup', () => {
  if (isDragging) { isDragging = false; if (isPlaying) updateLoop(); }
});
progressBar.addEventListener('touchstart', (e) => {
  isDragging = true;
  setProgressFromEvent(e.touches[0].clientX);
});
document.addEventListener('touchmove', (e) => { if (isDragging) setProgressFromEvent(e.touches[0].clientX); });
document.addEventListener('touchend', () => {
  if (isDragging) { isDragging = false; if (isPlaying) updateLoop(); }
});

console.log('🎵 شريط الموسيقى جاهز');




// ================================================================
// بيانات السور (مفصولة بين الغلاف الخارجي وصور آيات القراءة)
// ================================================================
const surahData = [
  { 
    id: 1, 
    name: 'الفاتحة', 
    type: 'مكية',
    // 1. صورة الغلاف الخارجية التي تظهر في البطاقة براني
    cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg',
    // 2. صور صفحات القراءة الداخلية (الآيات اللي بتقرأ منها)
    pages: [
      'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/bd4e5476-2923-4e58-9140-f9824215a938.jpg'
    ] 
  },
  { 
    id: 2, 
    name: 'البقرة', 
    type: 'مدنية',
    cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg',
    pages: ['https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/1d694931-d86d-4d2c-a8a4-c0f958c11ef3.jpg','https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/abd6ba2d-6c61-4e8f-b144-f27cf1376dae.jpg ', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/91e677e5-c1b6-444a-bbc0-3067cadec4a5.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/9fe0122f-29ba-436e-b763-35993e2e5c0d.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/56658586-3e3d-4aef-b17e-166621a9e79a.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/a11dd4f8-e14d-490d-a368-669ce4f0882c.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/fafc69b3-c28b-4c62-b68e-df66daeffe3f.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/421a288e-85ce-4ab0-a6bc-d73b31b0b4c8.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/a24a60f8-4195-4e86-9ef5-6d7b941b4e91.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/a24a60f8-4195-4e86-9ef5-6d7b941b4e91.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/48eafc1e-dd9a-4b71-b0e3-c960e1e30ac9.jpg','https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/a2c8534f-1007-40b7-b5ab-863a9192a007.jpg','https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/34b80927-743d-4e6a-9f81-e51e2fba66a0.jpg','https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/e7eda3a8-e97f-414f-8a67-0f2fef5a37da.jpg','https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/b3a33e44-4b0e-459e-aab3-dc487facea56.jpg','https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/3e79d6a1-4b91-42bd-8cab-0990ca9087c0.jpg','https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/5cde3654-f46f-4593-ab28-227edd3699e2.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/b4d07a9e-3ce8-47c6-8d7e-9527e72e51cf.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/adc5d502-e0ef-4636-b5ed-c55f52f5cf93.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/68d5df11-15d0-429b-8a52-fe5d1cc4ecab.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/75daaffb-7d29-4c28-b7d2-e64168cf4a05.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/94a20278-8967-42ba-adbc-6874dc639849.jpg', 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/c4a8cbc4-7d12-40cd-834d-f55da0d8c32f.jpg', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ] 
  },
  { id: 3, name: 'آل عمران', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 4, name: 'النساء', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 5, name: 'المائدة', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 6, name: 'الأنعام', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 7, name: 'الأعراف', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 8, name: 'الأنفال', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 9, name: 'التوبة', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 10, name: 'يونس', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 11, name: 'هود', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 12, name: 'يوسف', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 13, name: 'الرعد', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 14, name: 'إبراهيم', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 15, name: 'الحجر', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 16, name: 'النحل', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 17, name: 'الإسراء', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 18, name: 'الكهف', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 19, name: 'مريم', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 20, name: 'طه', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 21, name: 'الأنبياء', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 22, name: 'الحج', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 23, name: 'المؤمنون', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 24, name: 'النور', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 25, name: 'الفرقان', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 26, name: 'الشعراء', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 27, name: 'النمل', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 28, name: 'القصص', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 29, name: 'العنكبوت', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 30, name: 'الروم', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 31, name: 'لقمان', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 32, name: 'السجدة', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 33, name: 'الأحزاب', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 34, name: 'سبأ', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 35, name: 'فاطر', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 36, name: 'يس', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 37, name: 'الصافات', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 38, name: 'ص', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 39, name: 'الزمر', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 40, name: 'غافر', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 41, name: 'فصلت', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 42, name: 'الشورى', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 43, name: 'الزخرف', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 44, name: 'الدخان', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 45, name: 'الجاثية', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 46, name: 'الأحقاف', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 47, name: 'محمد', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 48, name: 'الفتح', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 49, name: 'الحجرات', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 50, name: 'ق', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 51, name: 'الذاريات', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 52, name: 'الطور', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 53, name: 'النجم', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 54, name: 'القمر', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 55, name: 'الرحمن', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 56, name: 'الواقعة', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 57, name: 'الحديد', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 58, name: 'المجادلة', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 59, name: 'الحشر', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 60, name: 'الممتحنة', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 61, name: 'الصف', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 62, name: 'الجمعة', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 63, name: 'المنافقون', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 64, name: 'التغابن', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 65, name: 'الطلاق', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 66, name: 'التحريم', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 67, name: 'الملك', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 68, name: 'القلم', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 69, name: 'الحاقة', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 70, name: 'المعارج', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 71, name: 'نوح', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 72, name: 'الجن', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 73, name: 'المزمل', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 74, name: 'المدثر', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 75, name: 'القيامة', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 76, name: 'الإنسان', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 77, name: 'المرسلات', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 78, name: 'النبأ', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 79, name: 'النازعات', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 80, name: 'عبس', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 81, name: 'التكوير', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 82, name: 'الانفطار', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 83, name: 'المطففين', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 84, name: 'الانشقاق', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 85, name: 'البروج', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 86, name: 'الطارق', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 87, name: 'الأعلى', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 88, name: 'الغاشية', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 89, name: 'الفجر', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 90, name: 'البلد', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 91, name: 'الشمس', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 92, name: 'الليل', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 93, name: 'الضحى', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 94, name: 'الشرح', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 95, name: 'التين', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 96, name: 'العلق', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 97, name: 'القدر', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 98, name: 'البينة', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 99, name: 'الزلزلة', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 100, name: 'العاديات', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 101, name: 'القارعة', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 102, name: 'التكاثر', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 103, name: 'العصر', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 104, name: 'الهمزة', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 105, name: 'الفيل', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 106, name: 'قريش', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 107, name: 'الماعون', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 108, name: 'الكوثر', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 109, name: 'الكافرون', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 110, name: 'النصر', type: 'مدنية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 111, name: 'المسد', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 112, name: 'الإخلاص', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 113, name: 'الفلق', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] },
  { id: 114, name: 'الناس', type: 'مكية', cover: 'https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/df938d9f-78b8-4198-9c1b-8b9a22d62705.jpg', pages: [] }
];


// عرض بطاقات السور براني باستخدام صورة الغلاف (s.cover)
const surahGrid = document.getElementById('surahGrid');

function renderSurahs(list) {
  if (!surahGrid) return;
  surahGrid.innerHTML = '';
  list.forEach(s => {
    const card = document.createElement('div');
    card.className = 'surah-card';
    card.innerHTML = `
      <div class="surah-badge">#${s.id}</div>
      <div class="surah-cover">
        <img src="${s.cover}" alt="غلاف سورة ${s.name}">
      </div>
      <div class="surah-info">
        <span class="surah-title">سورة ${s.name}</span>
        <span class="surah-subtitle">${s.type}</span>
      </div>
    `;
    card.addEventListener('click', () => openSurahReader(s));
    surahGrid.appendChild(card);
  });
}

// تشغيل البحث السريع (يبقى ثابتاً ولا يختفي)
const searchInput = document.getElementById('surahSearchInput');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    const filtered = surahData.filter(s => s.name.includes(query) || s.id.toString() === query);
    renderSurahs(filtered);
  });
}

// فتح القارئ وعرض صور الآيات الداخلية (s.pages)
let currentSurah = null;
let currentPageIndex = 0;

function openSurahReader(surah) {
  currentSurah = surah;
  currentPageIndex = 0;
  
  const readTitle = document.getElementById('readTitle');
  if (readTitle) readTitle.textContent = `سورة ${surah.name}`;
  
  updatePageViewer();
  showPage('quran-read');
}

function updatePageViewer() {
  if (!currentSurah || !currentSurah.pages || currentSurah.pages.length === 0) return;
  const imgEl = document.getElementById('readImage');
  const counterEl = document.getElementById('readPageCounter');
  
  if (imgEl) imgEl.src = currentSurah.pages[currentPageIndex];
  if (counterEl) counterEl.textContent = `${currentPageIndex + 1} / ${currentSurah.pages.length}`;
}

document.getElementById('readNextBtn')?.addEventListener('click', () => {
  if (currentSurah && currentPageIndex < currentSurah.pages.length - 1) {
    currentPageIndex++;
    updatePageViewer();
  }
});

document.getElementById('readPrevBtn')?.addEventListener('click', () => {
  if (currentSurah && currentPageIndex > 0) {
    currentPageIndex--;
    updatePageViewer();
  }
});

document.getElementById('readBackBtn')?.addEventListener('click', () => {
  showPage('quran');
});

// بدء عرض البطاقات
renderSurahs(surahData);














// ================================================================
// جافاسكربت تشغيل صوتيات القرآن الكريم - الشيخ ماهر المعيقلي (MP3Quran)
// ================================================================

// رابط سيرفر MP3Quran المباشر لرواية حفص عن عاصم - ماهر المعيقلي
const BASE_AUDIO_URL = "https://server12.mp3quran.net/maher/";

// إنشاء مشغل صوتي متوافق مع كافة المتصفحات
const globalAudioPlayer = new Audio();

const audioSurahsData = surahData.map((s) => {
  const formattedId = String(s.id).padStart(3, '0');
  return {
    id: Number(s.id),
    name: s.name,
    reciter: "الشيخ ماهر المعيقلي",
    photo: "https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/9fb30e3b-9e90-4dc3-b10b-695bb86e573b.jpg",
    audioSrc: `${BASE_AUDIO_URL}${formattedId}.mp3`
  };
});

const audioSurahGrid = document.getElementById('audioSurahGrid');
const audioSearchInput = document.getElementById('audioSurahSearchInput');

// عرض الكروت في الصفحة
function renderAudioSurahs(list) {
  if (!audioSurahGrid) return;
  audioSurahGrid.innerHTML = '';
  list.forEach(s => {
    const card = document.createElement('div');
    card.className = 'audio-surah-card';
    card.innerHTML = `
      <div class="audio-surah-photo">
        <img src="${s.photo}" alt="${s.reciter}">
      </div>
      <div class="audio-surah-info">
        <span class="audio-surah-name">سورة ${s.name}</span>
        <span class="audio-surah-reciter">${s.reciter}</span>
        <span class="audio-surah-number">رقم السورة: ${s.id}</span>
      </div>
    `;
    card.addEventListener('click', () => {
      const targetIndex = audioSurahsData.findIndex(item => item.id === s.id);
      if (targetIndex !== -1) {
        openAudioPlayer(targetIndex);
      }
    });
    audioSurahGrid.appendChild(card);
  });
}

if (audioSearchInput) {
  audioSearchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = audioSurahsData.filter(s => s.name.includes(q) || s.id.toString() === q);
    renderAudioSurahs(filtered);
  });
}

renderAudioSurahs(audioSurahsData);

// ===== عناصر المودال والتحكم =====
const playerModal = document.getElementById('quranPlayerModal');
const playerBg = document.getElementById('quranPlayerBg');
const playerClose = document.getElementById('quranPlayerClose');

const modalSurahName = document.getElementById('playerSurahName');
const modalPlayBtn = document.getElementById('modalPlayBtn');
const modalPlayIcon = document.getElementById('modalPlayIcon');
const modalPrevBtn = document.getElementById('modalPrevBtn');
const modalNextBtn = document.getElementById('modalNextBtn');
const modalProgressBar = document.getElementById('modalProgressBar');
const modalProgressFill = document.getElementById('modalProgressFill');
const modalCurrentTime = document.getElementById('modalCurrentTime');
const modalDuration = document.getElementById('modalDuration');

const optionsToggle = document.getElementById('modalOptionsToggle');
const optionsGroup = document.getElementById('quranPlayerOptionsGroup');
const repeatBtn = document.getElementById('repeatSurahBtn');
const shuffleBtn = document.getElementById('shuffleSurahBtn');

let currentAudioIndex = 0;
let isAudioPlaying = false;
let isRepeatMode = false;
let isShuffleMode = false;

function openAudioPlayer(index) {
  currentAudioIndex = index;
  loadAudioTrack(currentAudioIndex);
  if (playerModal) playerModal.classList.add('active');
  playAudioTrack();
}

function closeAudioPlayer() {
  if (playerModal) playerModal.classList.remove('active');
  pauseAudioTrack();
}

function loadAudioTrack(index) {
  const item = audioSurahsData[index];
  if (!item) return;
  if (modalSurahName) modalSurahName.textContent = `سورة ${item.name}`;
  
  globalAudioPlayer.src = item.audioSrc;
  globalAudioPlayer.load(); // إعادة تحميل المصدر الجديد
  
  if (modalProgressFill) modalProgressFill.style.width = '0%';
  if (modalCurrentTime) modalCurrentTime.textContent = '00:00';
  if (modalDuration) modalDuration.textContent = '00:00';
}

function playAudioTrack() {
  globalAudioPlayer.play().then(() => {
    isAudioPlaying = true;
    if (modalPlayIcon) modalPlayIcon.className = 'fas fa-pause';
  }).catch(err => {
    console.error("تعذر تشغيل الصوت تلقائياً:", err);
    isAudioPlaying = false;
    if (modalPlayIcon) modalPlayIcon.className = 'fas fa-play';
  });
}

function pauseAudioTrack() {
  globalAudioPlayer.pause();
  isAudioPlaying = false;
  if (modalPlayIcon) modalPlayIcon.className = 'fas fa-play';
}

if (modalPlayBtn) {
  modalPlayBtn.addEventListener('click', () => {
    if (isAudioPlaying) pauseAudioTrack();
    else playAudioTrack();
  });
}

if (modalNextBtn) modalNextBtn.addEventListener('click', () => playNextTrack());
if (modalPrevBtn) {
  modalPrevBtn.addEventListener('click', () => {
    currentAudioIndex = (currentAudioIndex - 1 + audioSurahsData.length) % audioSurahsData.length;
    loadAudioTrack(currentAudioIndex);
    playAudioTrack();
  });
}

function playNextTrack() {
  if (isShuffleMode) {
    currentAudioIndex = Math.floor(Math.random() * audioSurahsData.length);
  } else {
    currentAudioIndex = (currentAudioIndex + 1) % audioSurahsData.length;
  }
  loadAudioTrack(currentAudioIndex);
  playAudioTrack();
}

// أحداث المشغل الصوتي
globalAudioPlayer.addEventListener('timeupdate', () => {
  if (!globalAudioPlayer.duration) return;
  const pct = (globalAudioPlayer.currentTime / globalAudioPlayer.duration) * 100;
  if (modalProgressFill) modalProgressFill.style.width = pct + '%';
  if (modalCurrentTime) modalCurrentTime.textContent = formatAudioTime(globalAudioPlayer.currentTime);
  if (modalDuration) modalDuration.textContent = formatAudioTime(globalAudioPlayer.duration);
});

globalAudioPlayer.addEventListener('ended', () => {
  if (isRepeatMode) {
    playAudioTrack();
  } else {
    playNextTrack();
  }
});

if (modalProgressBar) {
  modalProgressBar.addEventListener('click', (e) => {
    const rect = modalProgressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    if (globalAudioPlayer.duration) {
      globalAudioPlayer.currentTime = pct * globalAudioPlayer.duration;
    }
  });
}

function formatAudioTime(sec) {
  if (isNaN(sec) || !sec) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// التحكم بالخيارات والإغلاق
if (playerClose) playerClose.addEventListener('click', closeAudioPlayer);
if (playerBg) playerBg.addEventListener('click', closeAudioPlayer);

if (optionsToggle && optionsGroup) {
  optionsToggle.addEventListener('click', () => {
    optionsGroup.classList.toggle('active');
  });
}

if (repeatBtn) {
  repeatBtn.addEventListener('click', () => {
    isRepeatMode = !isRepeatMode;
    repeatBtn.classList.toggle('active', isRepeatMode);
  });
}

if (shuffleBtn) {
  shuffleBtn.addEventListener('click', () => {
    isShuffleMode = !isShuffleMode;
    shuffleBtn.classList.toggle('active', isShuffleMode);
  });
}







// ================================================================
// صفحة الأذكار — الشبكة والمودال
// ================================================================

// 👇 حطي هنا رابط صورة واحدة موحدة تظهر في كل المربعات
const AZKAR_COVER_IMAGE = " https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/2c4bd733-66c7-462d-8c9b-e8db9556aee3.png ";

// 👇 كل عنصر: اسم الذكر + رابط صورة الذكر نفسه (اللي تتفتح في المودال)
// ضيفي أي عدد عايزاه بنفس الطريقة، والشبكة هتترتب لوحدها
const azkarData = [
  { id: 1, name: 'أذكار الصباح والمساء', image: ' https://i.supaimg.com/965e0c3e-50d9-4ba0-97dc-487d00fde583/7a27d245-6989-4e59-84f1-19b56a083a2d.png ' },
  
  { id: 2, name: 'أذكار بعد الصلاة',      image: 'ضعي رابط صورة هذا الذكر هنا' },
  
  { id: 3, name: 'أذكار النوم والاستيقاظ', image: 'ضعي رابط صورة هذا الذكر هنا' },
  
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  { id: 4, name: 'أدعية من القرآن والسنة', image: 'ضعي رابط صورة هذا الذكر هنا' },
  
];

const azkarGrid = document.getElementById('azkarGrid');

function renderAzkar(list) {
  if (!azkarGrid) return;
  azkarGrid.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'azkar-card';
    card.innerHTML = `
      <div class="azkar-card-image">
        <img src="${AZKAR_COVER_IMAGE}" alt="${item.name}">
      </div>
      <div class="azkar-card-info">
        <h3 class="azkar-title">${item.name}</h3>
        <span class="azkar-number">#${item.id}</span>
      </div>
    `;
    card.addEventListener('click', () => openAzkarModal(item.name, item.image));
    azkarGrid.appendChild(card);
  });
}

renderAzkar(azkarData);

// ===== المودال =====
const azkarModal = document.getElementById('azkarModal');
const azkarModalBg = document.getElementById('azkarModalBg');
const azkarModalClose = document.getElementById('azkarModalClose');
const azkarModalImg = document.getElementById('azkarModalImg');

function openAzkarModal(title, imageUrl) {
  if (azkarModalImg) {
    azkarModalImg.src = imageUrl;
    azkarModalImg.alt = title;
  }
  if (azkarModal) azkarModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAzkarModal() {
  if (azkarModal) azkarModal.classList.remove('active');
  document.body.style.overflow = '';
}

azkarModalBg?.addEventListener('click', closeAzkarModal);
azkarModalClose?.addEventListener('click', closeAzkarModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && azkarModal?.classList.contains('active')) closeAzkarModal();
});





// ================================================================
// صفحة المسبحة الإلكترونية
// ================================================================

// قائمة الأذكار (تقدري تضيفي أو تعدلي براحتك)
const tasbeehPhrases = [
  { key: 'subhanallah', label: 'سبحان الله' },
  { key: 'alhamdulillah', label: 'الحمد لله' },
  { key: 'allahuakbar', label: 'الله أكبر' },
  { key: 'lailahaillallah', label: 'لا إله إلا الله' },
  { key: 'astaghfirullah', label: 'أستغفر الله' },
  { key: 'lahawla', label: 'لا حول ولا قوة إلا بالله' },
  { key: 'salawat', label: 'اللهم صل على محمد' },
];

const TASBEEH_STORAGE_KEY = 'salma-tasbeeh-data';
const TASBEEH_SELECTED_KEY = 'salma-tasbeeh-selected';
const TASBEEH_TARGET_KEY = 'salma-tasbeeh-target';

function getTasbeehData() {
  try {
    return JSON.parse(localStorage.getItem(TASBEEH_STORAGE_KEY)) || {};
  } catch (e) { return {}; }
}
function saveTasbeehData(data) {
  localStorage.setItem(TASBEEH_STORAGE_KEY, JSON.stringify(data));
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

let tasbeehSelectedPhrase = localStorage.getItem(TASBEEH_SELECTED_KEY) || tasbeehPhrases[0].key;
let tasbeehTarget = parseInt(localStorage.getItem(TASBEEH_TARGET_KEY)) || 33;
let tasbeehSessionCount = 0; // عداد الجولة الحالية (يبدأ من صفر عند فتح الصفحة/التبديل)

const tasbeehSelectorEl = document.getElementById('tasbeehPhraseSelector');
const tasbeehTargetRowEl = document.getElementById('tasbeehTargetRow');
const tasbeehTapBtn = document.getElementById('tasbeehTapBtn');
const tasbeehCountEl = document.getElementById('tasbeehCount');
const tasbeehPhraseLabelEl = document.getElementById('tasbeehPhraseLabel');
const tasbeehRingFill = document.getElementById('tasbeehRingFill');
const statsPhraseNameEl = document.getElementById('statsPhraseName');

const RING_CIRCUMFERENCE = 2 * Math.PI * 88; // نفس نصف قطر الدائرة في الـ SVG

function renderTasbeehChips() {
  if (!tasbeehSelectorEl) return;
  tasbeehSelectorEl.innerHTML = '';
  tasbeehPhrases.forEach(p => {
    const chip = document.createElement('button');
    chip.className = 'tasbeeh-chip' + (p.key === tasbeehSelectedPhrase ? ' active' : '');
    chip.textContent = p.label;
    chip.addEventListener('click', () => {
      tasbeehSelectedPhrase = p.key;
      localStorage.setItem(TASBEEH_SELECTED_KEY, p.key);
      tasbeehSessionCount = 0;
      renderTasbeehChips();
      updateTasbeehDisplay();
    });
    tasbeehSelectorEl.appendChild(chip);
  });
}

function renderTasbeehTargets() {
  if (!tasbeehTargetRowEl) return;
  tasbeehTargetRowEl.querySelectorAll('.tasbeeh-target-btn').forEach(btn => {
    const val = parseInt(btn.dataset.target);
    btn.classList.toggle('active', val === tasbeehTarget);
    btn.onclick = () => {
      tasbeehTarget = val;
      localStorage.setItem(TASBEEH_TARGET_KEY, val);
      renderTasbeehTargets();
      updateTasbeehDisplay();
    };
  });
}

function getPhraseLabel(key) {
  const p = tasbeehPhrases.find(x => x.key === key);
  return p ? p.label : key;
}

function updateTasbeehDisplay() {
  const label = getPhraseLabel(tasbeehSelectedPhrase);
  if (tasbeehPhraseLabelEl) tasbeehPhraseLabelEl.textContent = label;
  if (statsPhraseNameEl) statsPhraseNameEl.textContent = label;

  const displayCount = tasbeehSessionCount % tasbeehTarget === 0 && tasbeehSessionCount > 0
    ? tasbeehTarget
    : tasbeehSessionCount % tasbeehTarget;
  if (tasbeehCountEl) tasbeehCountEl.textContent = displayCount;

  if (tasbeehRingFill) {
    const progress = displayCount / tasbeehTarget;
    tasbeehRingFill.style.strokeDasharray = RING_CIRCUMFERENCE;
    tasbeehRingFill.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
  }

  updateTasbeehStats();
}

function updateTasbeehStats() {
  const data = getTasbeehData();
  const phraseData = data[tasbeehSelectedPhrase] || {};
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  let todayCount = phraseData[todayKey()] || 0;
  let monthCount = 0, yearCount = 0, totalCount = 0;

  Object.keys(phraseData).forEach(dateStr => {
    const [y, m] = dateStr.split('-').map(Number);
    const count = phraseData[dateStr];
    totalCount += count;
    if (y === curYear) {
      yearCount += count;
      if (m === curMonth + 1) monthCount += count;
    }
  });

  document.getElementById('statToday').textContent = todayCount;
  document.getElementById('statMonth').textContent = monthCount;
  document.getElementById('statYear').textContent = yearCount;
  document.getElementById('statTotal').textContent = totalCount;

  // إجمالي كل الأذكار اليوم مجمّعة
  let allTodayTotal = 0;
  Object.keys(data).forEach(phraseKey => {
    allTodayTotal += (data[phraseKey][todayKey()] || 0);
  });
  document.getElementById('statTodayAll').textContent = allTodayTotal;
}

function tasbeehTap() {
  tasbeehSessionCount++;

  const data = getTasbeehData();
  if (!data[tasbeehSelectedPhrase]) data[tasbeehSelectedPhrase] = {};
  const dk = todayKey();
  data[tasbeehSelectedPhrase][dk] = (data[tasbeehSelectedPhrase][dk] || 0) + 1;
  saveTasbeehData(data);

  if (navigator.vibrate) navigator.vibrate(12);

  // عند إكمال الهدف: اهتزاز/صوت مختلف
  if (tasbeehSessionCount % tasbeehTarget === 0) {
    if (navigator.vibrate) navigator.vibrate([30, 60, 30]);
    if (typeof playBeep === 'function') playBeep();
  }

  updateTasbeehDisplay();
}

function tasbeehUndo() {
  if (tasbeehSessionCount <= 0) return;
  tasbeehSessionCount--;

  const data = getTasbeehData();
  const dk = todayKey();
  if (data[tasbeehSelectedPhrase] && data[tasbeehSelectedPhrase][dk] > 0) {
    data[tasbeehSelectedPhrase][dk]--;
    if (data[tasbeehSelectedPhrase][dk] <= 0) delete data[tasbeehSelectedPhrase][dk];
    saveTasbeehData(data);
  }
  updateTasbeehDisplay();
}

function tasbeehResetSession() {
  tasbeehSessionCount = 0;
  updateTasbeehDisplay();
}

if (tasbeehTapBtn) tasbeehTapBtn.addEventListener('click', tasbeehTap);
document.getElementById('tasbeehUndoBtn')?.addEventListener('click', tasbeehUndo);
document.getElementById('tasbeehResetBtn')?.addEventListener('click', tasbeehResetSession);

renderTasbeehChips();
renderTasbeehTargets();
updateTasbeehDisplay();

console.log('📿 صفحة المسبحة جاهزة');




// ================================================================
// صفحة كتب الروايات
// ================================================================

// 👇 ضيفي كتبك هنا: id، الاسم، رابط صورة الغلاف، ورابط الكتاب نفسه (جوجل درايف مثلاً)
const booksData = [
  {
    id: 1,
    title: " رسائل من القرآن ",
    cover: "https://8ghrb.com/wp-content/uploads/2021/06/22-34.jpg",
    link: "https://book-shadow.com/files/fhrst11/522.pdf"
  },
  {
    id: 2,
    title: "رسائل من النبي",
    cover: " https://8ghrb.com/wp-content/uploads/2023/10/22-39.jpeg  ",
    link: "https://book-shadow.com/files/fhrst14/795.pdf"
  },
  // كرري نفس الشكل لأي كتاب جديد وحطيه في القائمة دي
   {
   id: 3,
   title: " رسائل من عمر ابن الخطاب ",
   cover: "https://8ghrb.com/wp-content/uploads/2025/09/22-312-712x1024.jpg",
   link: "https://book-shadow.com/files/fhrst15/2846.pdf"
 },
  {
   id: 4,
   title: "رسائل من الصحابه ",
   cover: "https://8ghrb.com/wp-content/uploads/2024/02/22-1-669x1024.jpeg   ",
   link: "  https://book-shadow.com/files/fhrst14/1052.pdf"
 },
  {
   id: 5,
   title: "  رسائل من التابعين",
   cover: "https://8ghrb.com/wp-content/uploads/2025/07/22-43.jpg",
   link: "https://book-shadow.com/files/fhrst15/2329.pdf"
 },
  {
   id: 6,
   title: " ليطمئن قلبي ",
   cover: " https://8ghrb.com/wp-content/uploads/2019/09/22-26.jpg  ",
   link: " https://www.bookleaks.com/files/fhrst6/885.pdf"
 },
  {
   id: 7,
   title: "علي منهاج النبوة",
   cover: "https://8ghrb.com/wp-content/uploads/2021/01/22-488.jpg",
   link: "https://book-shadow.com/files/fhrst11/200.pdf"
 },
  {
   id: 8,
   title: "  خمسون قانونا للحب",
   cover: "https://8ghrb.com/wp-content/uploads/2024/08/22-1-678x1024.jpeg",
   link: "https://book-shadow.com/files/fhrst15/916.pdf"
 },
  {
   id: 9,
   title: " السيرة",
   cover: "https://8ghrb.com/wp-content/uploads/2026/01/22-453-682x1024.jpg",
   link: "https://book-shadow.com/files/fhrst15/2923.pdf"
 },
  {
   id: 10,
   title: " والذين معه ",
   cover: "https://8ghrb.com/wp-content/uploads/2025/04/22-685x1024.jpeg",
   link: "https://book-shadow.com/files/fhrst15/1826.pdf "
 },
  {
   id: 11,
   title: "  أرسس ",
   cover: "https://8ghrb.com/wp-content/uploads/2023/08/22-1.png",
   link: " https://book-shadow.com/files/fhrst12/892.pdf"
 },
  {
   id: 12,
   title: " أرسس 2 ",
   cover: "https://8ghrb.com/wp-content/uploads/2024/08/22-18-679x1024.jpg",
   link: "https://book-shadow.com/files/fhrst15/713.pdf"
 },
  {
   id: 13,
   title: "  آزر",
   cover: "https://8ghrb.com/wp-content/uploads/2025/04/22-18.jpg",
   link: "https://book-shadow.com/files/fhrst15/1928.pdf"
 },
  {
   id: 14,
   title: "  الزمهرير",
   cover: "https://8ghrb.com/wp-content/uploads/2026/01/22-300.jpg",
   link: "https://book-shadow.com/files/fhrst15/2790.pdf"
 },
  {
   id: 15,
   title: "السجيل",
   cover: "https://8ghrb.com/wp-content/uploads/2024/02/22-46-750x1024.jpg",
   link: "https://book-shadow.com/files/fhrst14/888.pdf"
 },
  {
   id: 16,
   title: " آبابيل",
   cover: "https://8ghrb.com/wp-content/uploads/2020/04/22-18.jpg",
   link: " https://book-shadow.com/files/fhrst12/79.pdf"
 },
  {
   id: 17,
   title: "جومانا  ",
   cover: "https://8ghrb.com/wp-content/uploads/2022/10/22.png",
   link: "https://book-shadow.com/files/fhrst12/405.pdf"
 },
 {
   id: 17,
   title: "الجساسة  ",
   cover: "https://8ghrb.com/wp-content/uploads/2022/04/22-189.jpg",
   link: "https://book-shadow.com/files/fhrst12/78.pdf"
 },
  {
   id: 18,
   title: "ردني إليك  ",
   cover: " https://8ghrb.com/wp-content/uploads/2021/01/22-529-683x1024.jpg",
   link: " https://book-shadow.com/files/fhrst12/210.pdf"
 },
  
   {
    id: 19,
    title: "أنت كل أشيائي الجميلة",
    cover: "https://8ghrb.com/wp-content/uploads/2019/05/22.jpeg",
    link: "https://book-shadow.com/files/fhrst12/209.pdf"
  },
  {
    id: 20,
    title: "  مدينة الحب لا يسكنها العقلاء",
    cover: "https://8ghrb.com/wp-content/uploads/2018/05/88-1.jpg",
    link: "https://www.bookleaks.com/files/fhrst7/212.pdf "
  },
  // كرري نفس الشكل لأي كتاب جديد وحطيه في القائمة دي
   {
   id: 21,
   title: " ليلة ماطرة ",
   cover: " https://8ghrb.com/wp-content/uploads/2023/08/22.jpeg",
   link: "https://book-shadow.com/files/fhrst12/926.pdf"
 },
 {
  id: 22,
  title: "  النداء",
  cover: "https://8ghrb.com/wp-content/uploads/2023/09/22-20.jpg",
  link: " https://book-shadow.com/files/fhrst12/994.pdf"
},
{
  id: 23,
  title: "  الغيهب",
  cover: "https://8ghrb.com/wp-content/uploads/2023/10/22-32-683x1024.png",
  link: "https://book-shadow.com/files/fhrst14/655.pdf"
},
{
  id: 24,
  title: "  الوليمه",
  cover: "https://8ghrb.com/wp-content/uploads/2023/10/22-40-682x1024.jpeg",
  link: "https://book-shadow.com/files/fhrst14/544.pdf"
},
{
  id: 25,
  title: "  الانتهازي ",
  cover: "https://8ghrb.com/wp-content/uploads/2023/11/22-718x1024.png",
  link: " https://book-shadow.com/files/fhrst14/633.pdf"
},
{
  id: 26,
  title: "  هذا ما حدث معها",
  cover: "https://8ghrb.com/wp-content/uploads/2025/07/22-24.jpg",
  link: "https://book-shadow.com/files/fhrst15/2377.pdf"
},
{
  id: 27,
  title: "  مجرة الرعب",
  cover: "https://8ghrb.com/wp-content/uploads/2023/06/22.png",
  link: "https://book-shadow.com/files/fhrst12/928.pdf"
},
{
  id: 28,
  title: "  هذا ما حدث معي ",
  cover: "https://8ghrb.com/wp-content/uploads/2021/11/22-14.jpg",
  link: ""
},
{
  id: 29,
  title: "  جحيم العابرين",
  cover: "https://8ghrb.com/wp-content/uploads/2021/11/22-15.jpg",
  link: ""
},
{
  id: 30,
  title: " أرض القرابين ",
  cover: "https://8ghrb.com/wp-content/uploads/2021/11/22-16.jpg",
  link: ""
},
{
  id: 31,
  title: "  سعد الدباس",
  cover: "https://8ghrb.com/wp-content/uploads/2021/11/22-17.jpg",
  link: ""
},
{
  id: 32,
  title: "  أجيج ",
  cover: "https://8ghrb.com/wp-content/uploads/2021/11/22-18.jpg",
  link: "https://book-shadow.com/files/fhrst11/996.pdf"
},
{
  id: 33,
  title: "  شبڪة العنكبوت",
  cover: "https://8ghrb.com/wp-content/uploads/2021/11/22-19.jpg",
  link: "https://book-shadow.com/files/fhrst12/919.pdf"
},
{
  id: 34,
  title: "  وهج البنفسج 2",
  cover: "https://8ghrb.com/wp-content/uploads/2021/11/22-20.jpg",
  link: ""
},
{
  id: 35,
  title: "  عرين الأسد",
  cover: "https://8ghrb.com/wp-content/uploads/2022/06/22-139.jpg",
  link: "https://book-shadow.com/files/fhrst12/907.pdf"
},
{
  id: 36,
  title: "  خوف 3",
  cover: "https://8ghrb.com/wp-content/uploads/2022/10/22-38.jpeg",
  link: "https://book-shadow.com/files/fhrst12/916.pdf"
},
{
  id: 37,
  title: "  صخب الخسيف",
  cover: "https://8ghrb.com/wp-content/uploads/2016/06/22-2.jpg",
  link: " https://www.bookleaks.com/files/fhrst7/365.pdf"
},
{
  id: 38,
  title: " بساتين عربستان",
  cover: "https://8ghrb.com/wp-content/uploads/2016/06/22.png",
  link: ""
},
{
  id: 39,
  title: "عصبة الشياطين",
  cover: "https://8ghrb.com/wp-content/uploads/2016/06/22-4.jpg",
  link: ""
},
{
  id: 40,
  title: "  لج",
  cover: "https://8ghrb.com/wp-content/uploads/2018/04/22-1.jpg",
  link: ""
},
{
  id: 41,
  title: "  ملكة الغرانيق",
  cover: "https://8ghrb.com/wp-content/uploads/2018/05/99.jpg",
  link: ""
},
{
  id: 42,
  title: "  وهج البنفسج",
  cover: "https://8ghrb.com/wp-content/uploads/2018/06/44.jpg",
  link: ""
},
{
  id: 43,
  title: "  ثورة الحور",
  cover: "https://8ghrb.com/wp-content/uploads/2018/10/22-108.jpg",
  link: ""  
},
{
  id: 44,
  title: "  خوف 2",
  cover: "https://8ghrb.com/wp-content/uploads/2018/11/22.jpg",
  link: "https://www.bookleaks.com/files/fhrst6/497.pdf"
},
{
  id: 45,
  title: "  رياح هجر",
  cover: "https://8ghrb.com/wp-content/uploads/2019/01/22-35.jpg",
  link: ""
},
{
  id: 46,
  title: "  صراع الملكات",
  cover: "https://8ghrb.com/wp-content/uploads/2019/06/22-46.jpg",
  link: ""
},
{
  id: 47,
  title: "  مخطوطات مدفونة",
  cover: "https://8ghrb.com/wp-content/uploads/2019/06/22-47.jpg",
  link: ""
},
{
  id: 48,
  title: "  الساحرة الهجينة",
  cover: "https://8ghrb.com/wp-content/uploads/2020/03/22-34.jpg",
  link: ""
},
{
  id: 49,
  title: "  الدوائر الخمس",
  cover: "https://8ghrb.com/wp-content/uploads/2020/03/22-35.jpg",
  link: ""
},
{
  id: 50,
  title: "  صخب الخسيف 2",
  cover: "https://8ghrb.com/wp-content/uploads/2020/03/22-36.jpg",
  link: "https://book-shadow.com/files/fhrst12/922.pdf"
},
{
  id: 51,
  title: "  صخب الخسيف 3",
  cover: "https://8ghrb.com/wp-content/uploads/2020/03/22-37.jpg",
  link: "https://book-shadow.com/files/fhrst12/923.pdf"
},
{
  id: 52,
  title: "  فجر السايرينات",
  cover: "https://8ghrb.com/wp-content/uploads/2021/04/22-27.jpg",
  link: ""
},
{
  id: 53,
  title: "  قضية لوز مر",
  cover: "https://8ghrb.com/wp-content/uploads/2022/04/22-82.jpg",
  link: "https://book-shadow.com/files/fhrst14/812.pdf"
},
{
  id: 54,
  title: "  قضية ست الحسن",
  cover: "https://8ghrb.com/wp-content/uploads/2022/04/22-83.jpg",
  link: "https://book-shadow.com/files/fhrst14/673.pdf"
},

{
  id: 55,
  title: "  دليل جدتي لقتل الأوغاد",
  cover: "https://8ghrb.com/wp-content/uploads/2023/01/22-9.jpg",
  link: "https://book-shadow.com/files/fhrst14/751.pdf"
},
{
  id: 56,
  title: "  روك آند رول ",
  cover: "https://8ghrb.com/wp-content/uploads/2023/10/22-11-731x1024.png",
  link: "https://book-shadow.com/files/fhrst13/277.pdf"
},
{
  id: 57,
  title: "  صديقي السيكوباتي",
  cover: "https://8ghrb.com/wp-content/uploads/2023/10/22-17.png",
  link: "https://book-shadow.com/files/fhrst13/325.pdf"
},

{
  id: 58,
  title: "  ثلاثة عشر",
  cover: "https://8ghrb.com/wp-content/uploads/2023/10/22-457-742x1024.jpg",
  link: "https://book-shadow.com/files/fhrst13/720.pdf"
},
{
  id: 59,
  title: "  قضية عنب الثعلب",
  cover: "https://8ghrb.com/wp-content/uploads/2024/01/22-348-661x1024.jpg",
  link: "https://book-shadow.com/files/fhrst15/39.pdf"
},
{
  id: 60,
  title: "  قنبلة للاستخدام الشخصي ",
  cover: "https://8ghrb.com/wp-content/uploads/2025/01/22-35.jpg",
  link: "https://book-shadow.com/files/fhrst15/1868.pdf"
},

{
  id: 61,
  title: "  جاز و روك",
  cover: "https://8ghrb.com/wp-content/uploads/2025/01/33-5.jpg",
  link: "https://book-shadow.com/files/fhrst15/2293.pdf"
},
{
  id: 62,
  title: "  قضية ذيل القط",
  cover: "https://8ghrb.com/wp-content/uploads/2025/08/22-28-672x1024.jpg",
  link: "https://book-shadow.com/files/fhrst15/2414.pdf"
},
{
  id: 2,
  title: "  قضية مخالب القط",
  cover: "https://8ghrb.com/wp-content/uploads/2026/01/22-829.jpg",
  link: " https://book-shadow.com/files/fhrst15/2837.pdf"
},


  
];

const booksGrid = document.getElementById('booksGrid');
const booksSearchInput = document.getElementById('booksSearchInput');

function renderBooks(list) {
  if (!booksGrid) return;
  booksGrid.innerHTML = '';

  if (list.length === 0) {
    booksGrid.innerHTML = '<div class="books-empty">لا توجد نتائج مطابقة 🔍</div>';
    return;
  }

  list.forEach(b => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-cover">
        <span class="book-badge">#${b.id}</span>
        <img src="${b.cover}" alt="${b.title}">
      </div>
      <div class="book-info">
        <span class="book-title">${b.title}</span>
        <span class="book-number">رواية رقم ${b.id}</span>
      </div>
    `;
    card.addEventListener('click', () => openBook(b));
    booksGrid.appendChild(card);
  });
}

function openBook(book) {
  if (!book.link) return;
  window.open(book.link, '_blank');
}

function normalizeArabic(text) {
  return text.trim();
}

if (booksSearchInput) {
  booksSearchInput.addEventListener('input', (e) => {
    const query = normalizeArabic(e.target.value.toLowerCase());
    if (!query) {
      renderBooks(booksData);
      return;
    }
    const filtered = booksData.filter(b => {
      const name = b.title.toLowerCase();
      const firstLetter = name.charAt(0);
      const lastLetter = name.charAt(name.length - 1);
      return (
        name.includes(query) ||               // البحث بالاسم
        b.id.toString() === query ||           // البحث بالرقم
        firstLetter === query ||               // البحث بأول حرف
        lastLetter === query                   // البحث بآخر حرف
      );
    });
    renderBooks(filtered);
  });
}

renderBooks(booksData);

console.log('📚 صفحة كتب الروايات جاهزة');






// ================================================================
// صفحة الرسالة اليومية
// ================================================================

// 👇 ضيفي كل الرسائل اللي عايزاها هنا، كل رسالة تظهر يوم واحد وبعدين يبدأ من الأول
const dailyMessages = [
  "يا صاحبة عيون الغزال، لا تسمحي للحزن أن يسرق ابتسامتك، فهناك قلب يدعو لكِ في كل صلاة، ويتمنى أن يراكِ أسعد الناس.",
  
  "قال رسول الله ﷺأحبّ الأعمالِ إلى اللهِ أدومُها وإنْ قلَّ لا تستعجلي الوصول، خطوة صغيرة كل يوم خير من توقف طويل. وأنا سأظل أدعو لكِ حتى تحققي كل أحلامك.",
  
  
  "صباح الخير يا صاحبة عيون الغزال، تذكري دائمًا أن الله لا يضيع تعبًا بُذل بإخلاص، وأنا أؤمن بكِ أكثر مما تتخيلين. كملي طريقك، فأنا فخور بكِ في كل خطوة.",
  
  "يا صاحبة عيون الغزال، مهما كانت الأيام ثقيلة، تذكري أن هناك شخصًا يحبك بصدق، ويدعو لكِ دائمًا، ويرى في نجاحك سعادته",
  
  
  "دعائي اليوم: اللهم اجعل قلبها مطمئنًا، وحقق لها ما تتمنى، وافتح لها أبواب الخير، واحفظ ابتسامتها التي أحبها.",
  
  
  "قال رسول الله ﷺ: احرص على ما ينفعك، واستعن بالله، ولا تعجز. اجعلي هذه الوصية رفيقة يومك، وستصلين بإذن الله إلى ما تتمنين",
  
  
  "يا أجمل من سكنت قلبي، لا تخافي من الفشل، فهو مجرد طريق يقود إلى النجاح. وأنا سأظل أصفق لكِ حتى في أصعب أيامك",
  
  
  "كل يوم يمر يجعلني أزداد يقينًا أنكِ تستحقين كل خير. اجتهدي، وثقي بالله، فما خاب قلبٌ علّق أمله بربه.",
  
  
  "إذا شعرتِ أن الطريق صعب، فتذكري أن بعد العسر يسرًا. وأنا سأبقى بجانبك بالدعاء والكلمة الطيبة حتى تبتسم روحك من جديد.",
  
  
  "يا صاحبة عيون الغزال... أحبكِ كما يحب المسافر أول خيط من نور الفجر، وكما يحب القلب الطمأنينة بعد طول قلق. وأسأل الله أن يحفظكِ، ويحقق لكِ كل حلم، وأن يكتب لكِ من الخير أكثر مما تتمنين.",
  
  
  "وجودكِ في حياتي علّمني أن بعض الأشخاص ليسوا مجرد صدفة، بل نعمة نحمد الله عليها كل يوم.",
  
  
  "لو استطعتُ أن أُهديكِ شيئًا، لأهديتكِ يقينًا لا يهتز، وقلبًا لا يعرف الخوف، وأيامًا كلها سعادة... لكنني أملك دعاءً لا ينقطع، وأسأل الله أن يجمع لكِ كل ذلك.",
  
  
  "كملي طريقكِ ولا تنظري للخلف، فأنا أرى فيكِ إنسانة قادرة على تحقيق المستحيل، وسأبقى أول من يصفق لكِ عندما تصلين.",
  
  
  "يا صاحبة عيون الغزال... أحبكِ حبًا يجعلني أدعو لكِ قبل أن أدعو لنفسي، وأفرح لنجاحكِ كأنه أعظم انتصار في حياتي.",
  
  
  "قال رسول الله ﷺ: إن الله إذا أحب عبدًا ابتلاه. فإن ضاقت بكِ الأيام، فلا تظني أن الله نسيكِ، بل اصبري، فبعد الصبر فرج، وبعد الدعاء إجابة بإذن الله.",
  
  
  "لا أريد من الدنيا شيئًا يسبق رؤيتكِ سعيدة، فابتسامتكِ عندي إنجاز، وراحتكِ دعاء، ونجاحكِ عيد لا ينتهي.",
  
  
  " إن تعبتِ يومًا، فتذكري أن هناك قلبًا يراكِ قوية حتى عندما تظنين أنكِ ضعيفة، ويؤمن أنكِ ستصلين مهما طال الطريق",
  
   "أكثر ما أتمناه ليس أن تسمعي كلمة أحبك، بل أن تشعري بها في كل دعوة أدعوها لكِ، وفي كل مرة أطلب من الله أن يجعل أيامك أجمل من أمنياتك.",
   
   
   "يا صاحبة عيون الغزال... لو كان للحب لغة لا يعرفها البشر، لكانت نظرتي إليكِ هي ترجمتها. أحبكِ بطريقة لا تُقال، بل تُدعى في السجود، وتُحفظ في القلب، وتظهر في الخوف عليكِ أكثر من نفسي",
   
];

const DAILY_MESSAGE_START_KEY = 'salma-daily-message-epoch';

function getTodayDayIndex() {
  // عدد الأيام منذ بداية التقويم، عشان الرسالة تتغير بعد كل نص ليل بشكل طبيعي
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysSinceEpoch = Math.floor(startOfDay.getTime() / 86400000);
  return daysSinceEpoch;
}

function getTodayMessage() {
  const dayIndex = getTodayDayIndex();
  const messageIndex = ((dayIndex % dailyMessages.length) + dailyMessages.length) % dailyMessages.length;
  return dailyMessages[messageIndex];
}

function renderDailyMessage() {
  const el = document.getElementById('dailyMessageText');
  if (el) el.textContent = getTodayMessage();
}

// زر النسخ
const dailyCopyBtn = document.getElementById('dailyCopyBtn');
const dailyCopyIcon = document.getElementById('dailyCopyIcon');
const dailyCopyLabel = document.getElementById('dailyCopyLabel');

function copyDailyMessage() {
  const text = getTodayMessage();
  const done = () => {
    if (dailyCopyBtn) dailyCopyBtn.classList.add('copied');
    if (dailyCopyIcon) dailyCopyIcon.className = 'fas fa-check';
    if (dailyCopyLabel) dailyCopyLabel.textContent = 'تم النسخ';
    setTimeout(() => {
      if (dailyCopyBtn) dailyCopyBtn.classList.remove('copied');
      if (dailyCopyIcon) dailyCopyIcon.className = 'fas fa-copy';
      if (dailyCopyLabel) dailyCopyLabel.textContent = 'نسخ الرسالة';
    }, 1600);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, callback) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(textarea);
  if (callback) callback();
}

if (dailyCopyBtn) dailyCopyBtn.addEventListener('click', copyDailyMessage);

// الساعة الحية + التاريخ الميلادي
function updateDailyClock() {
  const clockEl = document.getElementById('dailyClockTime');
  const dateEl = document.getElementById('dailyDateText');
  if (!clockEl && !dateEl) return;

  const now = new Date();

  if (clockEl) {
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}:${s}`;
  }

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}

setInterval(updateDailyClock, 1000);
updateDailyClock();
renderDailyMessage();

console.log('💌 صفحة الرسالة اليومية جاهزة');









// ================================================================
// صفحة صوتيات أغاني - الرسائل المتنقلة
// ================================================================

// 👇 ضيفي أي رسالة جديدة هنا براحتك، مفيش حد أقصى
const songsMessages = [
  "أُقاتِلُ الدُّنيا لأجلِكِ أُقاتِلُ الدُّنيا وقَلبي مُثقَلٌ بالألَمِ، وأُخفي دُموعي كي أراكِ بلا نَدَمِ. إذا ضاقَتِ الأيّامُ، كنتُ لها جَبَلًا، وإن خانَني الحظُّ، فما خُنتُ القَسَمِ. أُحاربُ ألفَ ريحٍ، وأمشي في العَتَمِ، لأنَّ في عينيكِ وطنًا... لا يَعرِفُ الهَزَمِ. سأبقى وإن طالَ الطريقُ مُقاتلًا، فالحُبُّ ليسَ كلامًا... بل صبرٌ وهممُ. وإن كُنتُ حزينًا، فحُزني من اشتياقي وليسَ لأنَّ قلبي يَخشى من العَدَمِ. أُريدُ انتصارًا يليقُ بحُبِّنا، لا نصرَ حربٍ... بل نصرَ قلبٍ على الألَم .فإن قالوا: تَعِبْتَ... قُلتُ: نعم، ولكنَّها تستحقُّ أن أُقاتِلَ العالَمَ كُلَّهُ لأجلِها.",
  "ما تعبتش منك... تعبت من الدنيا قالوا: سيبها... قلت: وكيف أترك قلبًا صار موطني؟ قالوا: الطريق صعب... قلت: أنا من يوم عرفتها، وأنا بحارب كل يوم. أخفي وجعي بابتسامة، وأكسر ألف هزيمة... حتى لا تنكسر هي مرة.لو كانوا يعلمون، أن كل ليلةٍ أنام فيها، أترك نصف قلبي ساهرًا عندها... والنصف الآخر يبكي في صمت. لم أحبها لأنها أجمل النساء، بل لأنها الوحيدة التي جعلتني أؤمن أن الحياة تستحق أن تُعاش. وإن خسرت العالم كله... لن أبكي. لكن إن خسرتها... فسأمشي بين الناس حيًّا، وقلبي قد دُفن قبل أن يُدفن جسدي. سأظل أقاتل... ليس لأنني لا أعرف الهزيمة، بل لأنني وعدت قلبي أنها ستكون آخر انتصارٍ أريده من الدنيا.",
  
  "أنا الذي حارب الدنيا لأجلها وحملتُ فوق كتفي ألفَ انكسارٍ ولم أشتكِ. كلما قالت لي الأيام: لن تصل...أجبتها: يكفيني أنها في نهاية الطريق. قاتلتُ خوفي... وقاتلتُ تعبي...وقاتلتُ الناسَ حين قالوا: إن الحبَّ لا ينتصر لكنهم لم يعلموا...أن قلبي اختارها مرةً، ومن يختار بقلبه... لا يعرف طريق الرجوع.كم ليلةٍ بكيتُ فيها بصمت، لا لأنني ضعيف...بل لأن الرجال أحيانًا تبكي حين تعجز عن حماية من تُحب. أخفيتُ جراحي كي تبتسم، وتحملتُ قسوة الدنيا كي لا تمسَّها دمعة. ولو طلبتْ مني العمر... لأعطيتها أيامي، ولو طلبتْ قلبي...لما ترددتُ لحظة. فإن انتصرتُ يومًا، فلن يكون النصر لي... بل لذلك القلب الذي رفض أن يستسلم رغم كل هذا الألم. وإن سقطتُ في منتصف الطريق، فاخبروا الدنيا جميعًا... أن رجلًا أحبَّ امرأةً بصدق، فحارب العالم كله من أجلها، ولم يندم... ولو خسر العالم بأسره.",

  "إن ضاقتِ الدنيا بعينيكِ يومًا، فاللهُ أرحمُ من كلِّ هذا الألم لا تُطفئي نورَ قلبِكِ من أجلِ عابرٍ،ففيكِ من الجمالِ ما يُزهرُ حتى بعد الذبول.أُقسمُ أنني كلما رأيتُ حزنَكِ، دعوتُ اللهَ سرًّا أن ينقلهُ إليَّ، ويتركَ لقلبِكِ راحةً لا تنتهي. اللهمَّ إن كان في صدرِها وجعٌ، فبدِّلهُ سكينةً، وإن كان في عينِها دمعٌ، فاجعل بعده فرحًا يُنسيها كلَّ ما مضى. وأنا هنا...لن أترك يدَكِ وإن تعبتُ، ولن أترك قلبَكِ وإن قسَت الأيام. فكوني قويةً، فما خلقَ اللهُ هذا القلبَ الجميلَ إلا ليبتسمَ من جديد. سيأتي يومٌ تضحكين فيه وتقولين: الحمدُ لله... لقد نجوتُ. وسأحمدُ اللهَ ألفَ مرة، لأنني رأيتُ الابتسامةَ تعودُ إلى وجهِكِ من جديد.",
];

let songsCurrentIndex = 0;

const songsMessageTextEl = document.getElementById('songsMessageText');
const songsMessageCounterEl = document.getElementById('songsMessageCounter');
const songsNextBtn = document.getElementById('songsNextBtn');
const songsPrevBtn = document.getElementById('songsPrevBtn');

function renderSongsMessage() {
  if (!songsMessageTextEl) return;
  songsMessageTextEl.style.opacity = '0';
  setTimeout(() => {
    songsMessageTextEl.textContent = songsMessages[songsCurrentIndex];
    songsMessageTextEl.style.opacity = '1';
  }, 150);

  if (songsMessageCounterEl) {
    songsMessageCounterEl.textContent = `${songsCurrentIndex + 1} / ${songsMessages.length}`;
  }
}

// الزر اليمين (السهم لليمين) بيجيب الرسالة الجاية
if (songsNextBtn) {
  songsNextBtn.addEventListener('click', () => {
    songsCurrentIndex = (songsCurrentIndex + 1) % songsMessages.length;
    renderSongsMessage();
  });
}

// زر الرجوع بيرجع للرسالة اللي قبلها
if (songsPrevBtn) {
  songsPrevBtn.addEventListener('click', () => {
    songsCurrentIndex = (songsCurrentIndex - 1 + songsMessages.length) % songsMessages.length;
    renderSongsMessage();
  });
}

renderSongsMessage();

console.log('🎬 صفحة صوتيات الأغاني جاهزة');












// ================================================================
// صفحة مواقع التواصل - نسخ رابط صارحني
// ================================================================

const sarahniCopyBtn = document.getElementById('sarahniCopyBtn');
const sarahniCopyIcon = document.getElementById('sarahniCopyIcon');
const sarahniLink = document.querySelector('.sarahni-open-btn')?.getAttribute('href');

function copySarahniLink() {
  if (!sarahniLink) return;

  const done = () => {
    if (sarahniCopyBtn) sarahniCopyBtn.classList.add('copied');
    if (sarahniCopyIcon) sarahniCopyIcon.className = 'fas fa-check';
    setTimeout(() => {
      if (sarahniCopyBtn) sarahniCopyBtn.classList.remove('copied');
      if (sarahniCopyIcon) sarahniCopyIcon.className = 'fas fa-copy';
    }, 1600);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(sarahniLink).then(done).catch(() => fallbackCopySarahni(done));
  } else {
    fallbackCopySarahni(done);
  }
}

function fallbackCopySarahni(callback) {
  const textarea = document.createElement('textarea');
  textarea.value = sarahniLink || '';
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(textarea);
  if (callback) callback();
}

if (sarahniCopyBtn) sarahniCopyBtn.addEventListener('click', copySarahniLink);

console.log('📱 صفحة مواقع التواصل جاهزة');