// Barnamaj curriculum, copied from docs/reference/barnamaj-program.pdf.
// Blank author/type = blank in the school's PDF (confirm with the school).
type Book = { title: string; author?: string; type?: string };
type Subject = { subject: string; books: Book[] };

export const barnamajTerms: { name: string; months: string; subjects: Subject[] }[] = [
  {
    name: "الفصل الأول",
    months: "August – November",
    subjects: [
      {
        subject: "الفقه",
        books: [
          { title: "الأخضري", author: "أبو يزيد عبد الرحمن بن سيدي محمد الصغير الأخضري", type: "استظهار" },
          { title: "العشماوي", author: "الشيخ عبد الباري بن أحمد، أبي النجا العشماوي القاهري الأزهري المالكي", type: "شرح" },
        ],
      },
      {
        subject: "الحديث",
        books: [
          { title: "أربعين حديث", author: "يحيى بن شرف النووي", type: "حفظ" },
          { title: "عمدة الأحكام", author: "الشيخ عبد الغني المقدسي", type: "استظهار" },
        ],
      },
      {
        subject: "العقيدة",
        books: [
          { title: "أصول الثلاثة", author: "الشيخ أبو عبدالله الإمام محمد بن عبد الوهاب بن سليمان بن علي التميمي الحنبلي", type: "حفظ" },
          { title: "لامية ابن تيمية", author: "شيخ الإسلام ابن تيمية الحراني", type: "حفظ" },
          { title: "حائية", author: "ابن أبي داود", type: "حفظ" },
        ],
      },
      {
        subject: "مصطلح الحديث",
        books: [
          { title: "منظومة البيقونية", author: "عمر بن محمد بن فتوح البيقني الدمشقي", type: "حفظ" },
          { title: "مصطلح الحديث لابن عثيمين", author: "محمد بن صالح العثيمين", type: "شرح" },
        ],
      },
      {
        subject: "أصول الفقه",
        books: [
          { title: "القواعد الفقهية", author: "عبد الرحمن بن ناصر السعدي", type: "شرح" },
          { title: "الأصول من علم الأصول", author: "محمد بن صالح العثيمين", type: "استظهار" },
        ],
      },
      {
        subject: "علم التجويد",
        books: [
          { title: "تحفة الأطفال", author: "العلامة سليمان الجمزوري", type: "حفظ" },
          { title: "الجزرية", author: "محمد بن محمد بن محمد بن علي الدمشقي", type: "حفظ" },
        ],
      },
      {
        subject: "آداب طلب العلم",
        books: [
          { title: "كيف تطلب العلم", author: "عائض القرني", type: "استظهار" },
          { title: "تعليم المتعلم", author: "برهان الدين الزرنوجي", type: "استظهار" },
        ],
      },
    ],
  },
  {
    name: "الفصل الثاني",
    months: "December – March",
    subjects: [
      {
        subject: "العقيدة",
        books: [
          { title: "عقيدة الواسطية", author: "شيخ الإسلام ابن تيمية الحراني", type: "استظهار" },
          { title: "القواعد المثلى", author: "محمد بن صالح العثيمين", type: "شرح" },
          { title: "مفتاح دار السعادة", author: "الحافظ الحكمي", type: "شرح" },
        ],
      },
      {
        subject: "الحديث",
        books: [{ title: "بلوغ المرام", author: "أحمد بن علي (الحافظ ابن حجر العسقلاني)", type: "استظهار" }],
      },
      {
        subject: "الفقه",
        books: [{ title: "المرشد المعين", author: "عبد الواحد بن عاشر المالكي", type: "شرح" }],
      },
      {
        subject: "مصطلح الحديث",
        books: [{ title: "نخبة الفخر", author: "الحافظ ابن حجر العسقلاني", type: "شرح" }],
      },
      {
        subject: "أصول الفقه",
        books: [{ title: "نظم الورقات", author: "ضياء الدين أبو المعالي عبدالملك بن يوسف", type: "حفظ المتن" }],
      },
      {
        subject: "علوم القرءان",
        books: [
          { title: "الواضح كتاب الأول", type: "شرح" },
          { title: "كتاب الثاني", type: "شرح" },
          { title: "تبصرة", author: "ابن الجوزي", type: "شرح" },
        ],
      },
      {
        subject: "اللغة النحو",
        books: [
          { title: "منظومة الأجرومية", author: "أبو عبد الله محمد بن عبد الله بن داود الصنهاجي", type: "استظهار" },
          { title: "رسالة النحوية", author: "مصطفى جواد", type: "شرح" },
        ],
      },
      {
        subject: "آداب طلب العلم",
        books: [
          { title: "الجامع لأخلاق الراوي والسامع", author: "أبوبكر أحمد بن علي بن ثابت (الخطيب البغدادي)", type: "استظهار" },
          { title: "المراشد السديدة", author: "أحمد بن علي القرني", type: "شرح" },
        ],
      },
      {
        subject: "السيرة النبوية",
        books: [
          { title: "نور اليقين", author: "محمد الخضري", type: "شرح" },
          { title: "منظومة الميئية", author: "ابن أبي العز الحنفي", type: "حفظ" },
        ],
      },
    ],
  },
  {
    name: "الفصل الثالث",
    months: "April – July",
    subjects: [
      {
        subject: "الحديث",
        books: [{ title: "المنتقى", author: "أبو الوليد سليمان بن خلف", type: "شرح" }],
      },
      {
        subject: "العقيدة",
        books: [
          { title: "العقيدة الطحاوية", author: "أبو جعفر الطحاوي", type: "شرح" },
          { title: "نظم مقدمة الرسالة", author: "أحسائي" },
        ],
      },
      {
        subject: "الفقه",
        books: [{ title: "متن الرسالة", author: "أبي زيد القيرواني", type: "استظهار" }],
      },
      {
        subject: "مهارات اللغوية",
        books: [{ title: "التدريبات اللغوية", author: "أحمد مختار عمر", type: "استظهار" }],
      },
      {
        subject: "أدب اللغة",
        books: [
          { title: "بانت سعاد", author: "كعب بن زهير", type: "شرح" },
          { title: "شنفرى الأزدي", author: "شاعر الجاهلي", type: "حفظ" },
        ],
      },
      {
        subject: "العروض",
        books: [{ title: "الواضح في علم العروض", author: "محمد علي الهاشمي", type: "استظهار" }],
      },
      {
        subject: "البلاغة",
        books: [{ title: "دروس البلاغة", author: "لأفاضل الأدباء المصريين", type: "شرح" }],
      },
      {
        subject: "علوم القرءان",
        books: [
          { title: "ترجمة القرءان", type: "استظهار" },
          { title: "آداب حملة القرءان", author: "يحي بن شرف الدين النووي", type: "استظهار" },
          { title: "منظومة زمزمي", author: "عبد العزيز الزمزمي", type: "حفظ" },
        ],
      },
    ],
  },
];
