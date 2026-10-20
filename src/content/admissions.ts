// Source: the school's admission rules page (docs/reference/barnamaj-program.pdf), written in Hausa.
// English translation for the website. Rule 7 points to the school days on the page instead of
// repeating the times, so the schedule is only written once (below).
// The Arabic is translated from this English (draft): the school must proofread it.
const rulesEn = [
  "The parent must bring the student, or send a representative.",
  "The application form fee (₦2,000) and the school fee (₦10,000) must be paid before classes start.",
  "The student must have memorised the Qur'an, or completed recitation (sauka) well enough that reading Arabic is not difficult.",
  "The student must bring the certificate from the school where they memorised the Qur'an or completed sauka.",
  "Every student must have the study materials for each term.",
  "Students must avoid any dress or conduct that goes against the Shari'ah or the school rules.",
  "Students must arrive at school on time, on the school days shown above.",
  "A student who is absent for three days may be suspended by the school, unless there is a strong reason.",
  "If a student has a medical problem, the school must be told promptly.",
  "Students must respect and honour their teachers.",
];
const rulesAr: typeof rulesEn = [
  "يجب أن يُحضر وليّ الأمر الطالبَ بنفسه، أو يُرسل من ينوب عنه.",
  "يجب دفع رسوم استمارة الطلب (₦2,000) والرسوم الدراسية (₦10,000) قبل بدء الدراسة.",
  "يجب أن يكون الطالب قد حفظ القرآن الكريم، أو أتمّ قراءته قراءة جيدة لا تصعب معها عليه قراءة العربية.",
  "يجب أن يُحضر الطالب شهادة المدرسة التي حفظ فيها القرآن أو أتمّ فيها قراءته.",
  "يجب أن تكون لدى كل طالب الكتب والأدوات الدراسية لكل فصل دراسي.",
  "يجب على الطلاب اجتناب كل لباس أو سلوك يخالف الشريعة أو نظام المدرسة.",
  "يجب أن يحضر الطلاب إلى المدرسة في الوقت المحدد، في أيام الدراسة المذكورة أعلاه.",
  "الطالب الذي يغيب ثلاثة أيام قد توقفه المدرسة عن الدراسة، إلا إذا كان له عذر قوي.",
  "إذا كانت لدى الطالب مشكلة صحية، يجب إبلاغ المدرسة بذلك فورًا.",
  "يجب على الطلاب احترام معلميهم وتوقيرهم.",
];
export const admissionRules = { en: rulesEn, ar: rulesAr };

// Fees and school days are also on the home page, in both languages (Arabic = draft for the school to proofread).
const feesEn = [
  { label: "Application form", amount: "₦2,000" },
  { label: "School fees", amount: "₦10,000" },
];
const feesAr: typeof feesEn = [
  { label: "استمارة الطلب", amount: "₦2,000" },
  { label: "الرسوم الدراسية", amount: "₦10,000" },
];
export const fees = { en: feesEn, ar: feesAr };

const scheduleEn = [
  { days: "Saturday and Sunday", time: "8:00am to 6:00pm" },
  { days: "Monday to Friday", time: "3:00pm to 6:00pm" },
];
const scheduleAr: typeof scheduleEn = [
  { days: "السبت والأحد", time: "من 8:00 صباحًا إلى 6:00 مساءً" },
  { days: "من الاثنين إلى الجمعة", time: "من 3:00 عصرًا إلى 6:00 مساءً" },
];
export const schedule = { en: scheduleEn, ar: scheduleAr };

// Default term fee when accepting an application (staff can change it on the Accept screen).
export const TERM_FEE_NAIRA = 10000;
