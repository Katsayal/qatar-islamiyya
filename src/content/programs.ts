// The /programs page, English and Arabic (`ar: typeof en`). The Arabic is a draft for the school to proofread,
// including the full Arabic title of Barnamaj (the school's PDF has the official one).
// The Barnamaj days/times bullet is the open "school days" question (PROGRESS, Pending from the school).
const en = [
  {
    slug: "tahfiz",
    name: "Tahfiz",
    nameAr: "التحفيظ",
    intro: "Qur'an memorisation in graded levels, from Level 1 upward.",
    points: [
      "About five classes, each led by one teacher and named after a famous reciter.",
      "Every day the student recites new memorisation (hifz) and revises earlier lessons (muraja'ah).",
      "Lower levels are measured in lines, higher levels in pages.",
      "Each recitation is graded: Jayyid, Jayyid Jiddan or Mumtaz.",
      "At the end of the year students move up to the next level.",
    ],
  },
  {
    slug: "maahad",
    name: "Ma'ahad",
    nameAr: "المعهد",
    intro: "Our flagship: memorise the whole Qur'an in one year.",
    points: [
      "One year, three terms, with students and teachers in the mosque.",
      "Students are grouped in halqas, each with its own teacher.",
      "A minimum of two pages of new memorisation every day.",
      "Progress is tracked against the 604 pages of the Madinah mushaf.",
    ],
  },
  {
    slug: "barnamaj",
    name: "Barnamaj",
    nameAr: "البرنامج",
    intro: "The Program of Qualifying Students in Basic Islamic Education.",
    points: [
      "A one-year program for students who have already memorised the Qur'an or completed sauka.",
      "About forty books across fiqh, hadith, aqidah, grammar, Arabic literature and more, taught by several teachers.",
      "Each book is studied by memorisation (حفظ), recitation from memory (استظهار) or explanation (شرح).",
      "Classes are on Saturday and Sunday 8:30am to 4:00pm, and Tuesday and Wednesday 3:00pm to 6:00pm.",
      "An exam for each book at the end of every term.",
    ],
  },
];

const ar: typeof en = [
  {
    slug: "tahfiz",
    name: "تحفيظ القرآن الكريم",
    nameAr: "التحفيظ",
    intro: "حفظ القرآن الكريم في مستويات متدرجة، من المستوى الأول فما فوق.",
    points: [
      "نحو خمسة فصول، لكل فصل معلم، وتحمل أسماء قرّاء مشهورين.",
      "يسمّع الطالب كل يوم حفظًا جديدًا ويراجع ما حفظه من قبل.",
      "تُقاس المستويات الأولى بالأسطر، والمستويات العليا بالصفحات.",
      "يُقيَّم كل تسميع: جيد، أو جيد جدًا، أو ممتاز.",
      "في نهاية العام ينتقل الطلاب إلى المستوى التالي.",
    ],
  },
  {
    slug: "maahad",
    name: "حفظ القرآن في سنة",
    nameAr: "المعهد",
    intro: "برنامجنا الأبرز: حفظ القرآن الكريم كاملًا في سنة واحدة.",
    points: [
      "سنة واحدة من ثلاثة فصول دراسية، يجتمع فيها الطلاب والمعلمون في المسجد.",
      "يُقسَّم الطلاب إلى حلقات، لكل حلقة معلمها.",
      "صفحتان على الأقل من الحفظ الجديد كل يوم.",
      "يُتابَع التقدم على صفحات مصحف المدينة البالغة 604 صفحات.",
    ],
  },
  {
    slug: "barnamaj",
    name: "برنامج تأهيل الطلاب",
    nameAr: "البرنامج",
    intro: "برنامج تأهيل الطلاب في العلوم الإسلامية الأساسية.",
    points: [
      "برنامج مدته سنة واحدة للطلاب الذين حفظوا القرآن أو أتمّوا قراءته.",
      "نحو أربعين كتابًا في الفقه والحديث والعقيدة والنحو والأدب العربي وغيرها، يدرّسها عدة معلمين.",
      "يُدرس كل كتاب حفظًا، أو استظهارًا، أو شرحًا.",
      "الدراسة يومي السبت والأحد من 8:30 صباحًا إلى 4:00 عصرًا، ويومي الثلاثاء والأربعاء من 3:00 عصرًا إلى 6:00 مساءً.",
      "امتحان لكل كتاب في نهاية كل فصل دراسي.",
    ],
  },
];

export const programDetails = { en, ar };
