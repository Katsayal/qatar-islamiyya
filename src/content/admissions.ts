// Source: the school's admission rules page (docs/reference/barnamaj-program.pdf). Hausa kept as written.
export const admissionRulesHa = [
  "Mahaifi ne zai kawo dansa ko wakili.",
  "Biyan kudin shiga form (2000) da kuma kudin makaranta (10000) kafin fara karatu.",
  "Dalibi ya zama ya hardace Alqur'ani ko kuma yayi sauka mai kyau ta yadda karanta Larabci ba zai bashi wahala ba.",
  "Dalibi zai zo da shedar makarantar da yayi harda ko sauka.",
  "Wajibi ne mallakar kayan karatu na kowanne term.",
  "Kiyaye zuwa da shiga wadda ta sabawa shari'a ko dokar makaranta.",
  "Wajibi ne kiyaye zuwa makaranta akan lokaci: Asabar da Lahadi 8:30 zuwa 4:00pm, Talata da Laraba 3:00 zuwa 6:00pm.",
  "Idan dalibi ya kai kwana uku bai zo ba, hakan na iya sa makaranta ta dakatar da shi idan babu wani dalili mai karfi.",
  "Idan larura ta samu dalibi a sanar da makaranta akan lokaci.",
  "Wajibi ne kulawa da girmama malamai.",
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
