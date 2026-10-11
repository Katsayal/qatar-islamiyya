// Source: the school's admission rules page (docs/reference/barnamaj-program.pdf), written in Hausa.
// English translation for the website. Rule 7 points to the school days on the page instead of
// repeating the times, so the schedule is only written once (below).
export const admissionRules = [
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

export const fees = [
  { label: "Application form", amount: "₦2,000" },
  { label: "School fees", amount: "₦10,000" },
];

export const schedule = [
  { days: "Saturday and Sunday", time: "8:00am to 6:00pm" },
  { days: "Monday to Friday", time: "3:00pm to 6:00pm" },
];

// Default term fee when accepting an application (staff can change it on the Accept screen).
export const TERM_FEE_NAIRA = 10000;
