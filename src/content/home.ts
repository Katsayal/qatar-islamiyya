// Home page text, English and Arabic (`ar: typeof en`: TypeScript refuses a missing Arabic field).
// The Arabic is a draft: the school must proofread it.

type Program = { slug: string; name: string; nameAr: string; text: string; image?: string };

const en = {
  // `image` (optional, a path under /public) turns a program card into a photo card with a green overlay.
  programs: [
    {
      slug: "tahfiz",
      name: "Tahfiz",
      nameAr: "التحفيظ",
      text: "Daily Qur'an memorisation and revision in graded levels, under dedicated teachers.",
    },
    {
      slug: "maahad",
      name: "Ma'ahad",
      nameAr: "المعهد",
      text: "Our flagship: memorise the whole Qur'an in one year, in halqas held in the mosque.",
    },
    {
      slug: "barnamaj",
      name: "Barnamaj",
      nameAr: "البرنامج",
      text: "Qualifying students in basic Islamic education through a structured book-by-book curriculum.",
    },
  ] as Program[],

  // Quick facts strip under the hero (all from the SPEC).
  facts: [
    { value: "289+", label: "Students Enrolled" },
    { value: "29+", label: "Expert Staffs" },
    { value: "5", label: "Tahfiz Classes" },
    { value: "7+", label: "Ma'ahad Halqas" },
  ],

  // How admission works (from the school's rules on /admissions; the fees line is built in the page).
  admissionSteps: [
    { title: "Apply online", text: "Fill in the application form and upload a photo." },
    { title: "Pay the fees", text: "The form fee (once) and the school fee, before classes start." },
    {
      title: "Recitation check",
      text: "Students should have memorised the Qur'an or completed good recitation, so reading Arabic is easy.",
    },
    { title: "Start classes", text: "Bring the previous school's certificate and the books for the term." },
  ],
};

const ar: typeof en = {
  // On Arabic pages `name` is the Arabic description under the big gold name.
  programs: [
    {
      slug: "tahfiz",
      name: "تحفيظ القرآن الكريم",
      nameAr: "التحفيظ",
      text: "حفظ يومي للقرآن الكريم ومراجعة في مستويات متدرجة، مع معلمين متفرغين.",
    },
    {
      slug: "maahad",
      name: "حفظ القرآن في سنة",
      nameAr: "المعهد",
      text: "برنامجنا الأبرز: حفظ القرآن الكريم كاملًا في سنة واحدة، في حلقات داخل المسجد.",
    },
    {
      slug: "barnamaj",
      name: "برنامج تأهيل الطلاب",
      nameAr: "البرنامج",
      text: "تأهيل الطلاب في العلوم الإسلامية الأساسية بمنهج منظّم كتابًا بعد كتاب.",
    },
  ],

  facts: [
    { value: "289+", label: "طالبًا مسجّلًا" },
    { value: "29+", label: "معلمًا وموظفًا" },
    { value: "5", label: "فصول التحفيظ" },
    { value: "7+", label: "حلقات المعهد" },
  ],

  admissionSteps: [
    { title: "قدّم عبر الإنترنت", text: "املأ استمارة الطلب وارفع صورة الطالب." },
    { title: "ادفع الرسوم", text: "رسوم الاستمارة (مرة واحدة) والرسوم الدراسية، قبل بدء الدراسة." },
    {
      title: "التحقق من القراءة",
      text: "ينبغي أن يكون الطالب قد حفظ القرآن أو أتمّ قراءته قراءة جيدة، حتى تسهل عليه قراءة العربية.",
    },
    { title: "ابدأ الدراسة", text: "أحضر شهادة المدرسة السابقة وكتب الفصل الدراسي." },
  ],
};

export const home = { en, ar };
