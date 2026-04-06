export const config = {
  title: "Cursor Saudi",
  description: "Cursor Saudi Community",
  author: "Cursor Saudi",
  speakers: [
    {
      name: "Abdullah Mosaibah",
      nameAr: "عبدالله المصيباح",
      initials: "AM",
      twitter: "https://x.com/AbdoMosaibah",
      events: ["Kickoff"],
    },
    {
      name: "Dan Perks",
      nameAr: "دان بيركس",
      initials: "DP",
      twitter: "https://x.com/danperks",
      events: ["Kickoff"],
    },
    {
      name: "Faris Hijazi",
      nameAr: "فارس حجازي",
      initials: "FH",
      twitter: "https://x.com/theefaris",
      events: ["Build your MVP with AI!"],
    },
    {
      name: "Usman Siddique",
      nameAr: "عثمان صديق",
      initials: "US",
      linkedin: "https://www.linkedin.com/in/muhammmadosman/",
      events: ["Contributing to Open Source with Cursor"],
    },
    {
      name: "Nick Miller",
      nameAr: "نيك ميلر",
      initials: "NM",
      twitter: "https://x.com/nickwm",
      events: ["Ship in 3 Hours with Cursor"],
    },
  ],
  ambassadors: [
    {
      name: "Mazen Alotaibi",
      nameAr: "مازن العتيبي",
      role: "Saudi Arabia Leader",
      roleAr: "قائد المجتمع في السعودية",
      city: "Riyadh",
      cityAr: "الرياض",
      email: "mazen.ota@gmail.com",
      twitter: "https://x.com/ma7dev",
      twitterHandle: "ma7dev",
      linkedin: "https://www.linkedin.com/in/ma7dev/",
    },
    {
      name: "Abdulhakeem Almidan",
      nameAr: "عبدالحكيم الميدان",
      role: "Ambassador",
      roleAr: "سفير",
      city: "Khobar",
      cityAr: "الخبر",
      twitter: "https://x.com/abdulhakeem_mdn",
      linkedin: "https://www.linkedin.com/in/abdulhakeem-almidan/",
      status: "retired",
    },
  ],
  social: {
    luma: "https://lu.ma/cursor-saudi",
    discord: "https://discord.gg/KpsKtegvz4",
    twitter: "https://x.com/cursorsaudi",
    email: "cursorsaudi@gmail.com",
    github: "https://github.com/cursorsaudi",
  },
  partners: [
    {
      name: "Cursor",
      nameAr: "كيرسر",
      role: "official",
      logo: "/logos/cursor.svg",
      url: "https://cursor.com",
      description:
        "The AI-native code editor built on VS Code. Ship faster with intelligent autocomplete, chat, and agentic coding.",
      descriptionAr:
        "محرر الأكواد المدعوم بالذكاء الاصطناعي المبني على VS Code. طوّر أسرع مع الإكمال الذكي والدردشة والبرمجة الوكيلية.",
      cities: [],
    },
    {
      name: "Dal",
      nameAr: "دال",
      role: "community-partner",
      logo: "/logos/dal.png",
      url: "https://x.com/DalData_sa",
      description:
        "A Saudi nonprofit empowering data science & AI enthusiasts through hands-on programs, datathons, and job-shadowing. Supported and funded by Misk Foundation and SDAIA.",
      descriptionAr:
        "جمعية غير ربحية سعودية تمكّن المهتمين بعلوم البيانات والذكاء الاصطناعي من خلال برامج عملية وداتاثونات. مدعومة وممولة من مؤسسة مسك وسدايا.",
      cities: ["Riyadh"],
    },
    {
      name: "Mozn",
      nameAr: "مزن",
      role: "venue-host",
      logo: "/logos/mozn.svg",
      url: "https://mozn.ai",
      description:
        "Saudi AI company building enterprise AI products for the Arabic-first market, including NLP, risk, and compliance solutions.",
      descriptionAr:
        "شركة ذكاء اصطناعي سعودية تبني منتجات ذكاء اصطناعي للمؤسسات في السوق العربي، تشمل حلول معالجة اللغة والمخاطر والامتثال.",
      cities: ["Riyadh"],
    },
    {
      name: "CODE",
      nameAr: "مركز ريادة الأعمال الرقمية",
      role: "venue-host",
      logo: "/logos/code.svg",
      url: "https://code.mcit.gov.sa/en",
      description:
        "Center of Digital Entrepreneurship by MCIT — coworking spaces, business services, and acceleration programs supporting digital startups.",
      descriptionAr:
        "مركز ريادة الأعمال الرقمية التابع لوزارة الاتصالات — مساحات عمل مشتركة وخدمات أعمال وبرامج تسريع لدعم الشركات الرقمية الناشئة.",
      cities: ["Riyadh"],
    },
    {
      name: "Monshaat",
      nameAr: "منشآت",
      role: "venue-host",
      logo: "/logos/monshaat-dark.svg",
      url: "https://www.monshaat.gov.sa/ar/ssc",
      description:
        "SME support centers by Monshaat — providing training, mentorship, consulting, and coworking spaces for entrepreneurs across Saudi Arabia.",
      descriptionAr:
        "مراكز دعم المنشآت — تقدم التدريب والإرشاد والاستشارات ومساحات العمل المشتركة لرواد الأعمال في السعودية.",
      cities: ["Khobar"],
    },
    {
      name: "Nauatech",
      nameAr: "نواتك",
      role: "past-community-partner",
      logo: "/logos/nauatech.svg",
      url: "https://naua.tech/",
      description:
        "A Saudi tech community that partnered with Cursor Saudi for early events in Riyadh.",
      descriptionAr:
        "مجتمع تقني سعودي شارك في دعم فعاليات Cursor السعودية المبكرة في الرياض.",
      cities: ["Riyadh"],
    },
  ],
} as const;
