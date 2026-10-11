// `image` (optional, a path under /public) turns a program card into a photo card with a green overlay.
export const programs: { slug: string; name: string; nameAr: string; text: string; image?: string }[] = [
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
];

// Quick facts strip under the hero (all from the SPEC).
export const facts = [
  { value: "3", label: "Programs" },
  { value: "Ethical", label: "Guidance & Counselling" },
  { value: "All Week", label: "Mon to Sun" },
  { value: "Daura", label: "Katsina State, Nigeria" },
];

// How admission works (from the school's rules on /admissions; the fees line is built in the page).
export const admissionSteps = [
  { title: "Apply online", text: "Fill in the application form and upload a photo." },
  { title: "Pay the fees", text: "The form fee (once) and the school fee, before classes start." },
  {
    title: "Recitation check",
    text: "Students should have memorised the Qur'an or completed good recitation, so reading Arabic is easy.",
  },
  { title: "Start classes", text: "Bring the previous school's certificate and the books for the term." },
];
