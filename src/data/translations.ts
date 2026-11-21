import { LanguageCode, NavTab } from "../types";

export interface TranslationSet {
  brandTagline: string;
  nav: Record<NavTab, string>;
  accessibilityTitle: string;
  largerText: string;
  highContrast: string;
  textToSpeech: string;
  ttsSpeakPage: string;
  ttsStop: string;
  languageLabel: string;
  helpCardTitle: string;
  helpCardBody: string;
  chatNow: string;
  searchPlaceholder: string;
  simulateAbsence: string;
  roles: {
    learner: string;
    educator: string;
    admin: string;
  };
  welcomeBack: string;
  heroSubtitle: string;
  resumeLearning: string;
  currentMasteryLabel: string;
  kpis: {
    overallProgress: string;
    quizAccuracy: string;
    studyStreak: string;
    studyStreakSub: string;
    totalStudyTime: string;
  };
  myCourses: string;
  continueLearning: string;
  startCourse: string;
  studyPlannerTitle: string;
  studyPlannerSubtitle: string;
  startSession: string;
  adaptiveTopicMastery: string;
  learningProgressTitle: string;
  thisWeek: string;
  lastWeek: string;
  recentActivity: string;
  achievementTitle: string;
  achievementBody: string;
  viewProgress: string;
  practiceTitle: string;
  practiceSubtitle: string;
  submitAnswer: string;
  nextQuestion: string;
  readAloud: string;
  aiFeedbackTitle: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationSet> = {
  en: {
    brandTagline: "Learn · Practice · Master",
    nav: {
      dashboard: "Dashboard",
      courses: "My Courses",
      practice: "Practice",
      planner: "Study Planner",
      progress: "My Progress",
      feedback: "Review & Notes",
      resources: "Resources",
      settings: "Settings",
    },
    accessibilityTitle: "Accessibility & Language",
    largerText: "Larger Text",
    highContrast: "High Contrast",
    textToSpeech: "Text-to-Speech",
    ttsSpeakPage: "Read Screen",
    ttsStop: "Stop Audio",
    languageLabel: "Language",
    helpCardTitle: "Need help? Study assistant is here",
    helpCardBody: "Stuck on loops, functions, or syntax? Get clear step-by-step guidance.",
    chatNow: "Ask Assistant",
    searchPlaceholder: "Search courses, topics...",
    simulateAbsence: "Simulate 5-Day Break",
    roles: {
      learner: "Learner",
      educator: "Educator",
      admin: "Admin",
    },
    welcomeBack: "Welcome back, Fahad!",
    heroSubtitle:
      "Focused micro-lessons and interactive practice. Pick up right where you left off.",
    resumeLearning: "Resume Learning",
    currentMasteryLabel: "Your current mastery",
    kpis: {
      overallProgress: "Overall Progress",
      quizAccuracy: "Quiz Accuracy",
      studyStreak: "Study Streak",
      studyStreakSub: "Consistent progress!",
      totalStudyTime: "Total Study Time",
    },
    myCourses: "My Courses",
    continueLearning: "Continue Learning",
    startCourse: "Start Course",
    studyPlannerTitle: "Daily Study Plan",
    studyPlannerSubtitle:
      "Choose your available time — we organize a focused session around your priority topics.",
    startSession: "Start Session",
    adaptiveTopicMastery: "Skill Mastery",
    learningProgressTitle: "Your Learning Progress",
    thisWeek: "This Week",
    lastWeek: "Last Week",
    recentActivity: "Recent Activity",
    achievementTitle: "Great work!",
    achievementBody:
      "Your retention on core Python concepts climbed +12% this week across short daily sessions.",
    viewProgress: "View Progress",
    practiceTitle: "Targeted Practice",
    practiceSubtitle:
      "Interactive questions focused on reinforcing core concepts like Loops and Functions.",
    submitAnswer: "Submit Answer",
    nextQuestion: "Next Question",
    readAloud: "Read Aloud",
    aiFeedbackTitle: "Step-by-Step Explanation",
  },
  ur: {
    brandTagline: "سیکھیں · مشق کریں · مہارت پائیں",
    nav: {
      dashboard: "ڈیش بورڈ",
      courses: "میرے کورسز",
      practice: "مشق",
      planner: "اسٹڈی پلانر",
      progress: "میری پیش رفت",
      feedback: "جائزہ اور نوٹس",
      resources: "وسائل",
      settings: "ترتیبات",
    },
    accessibilityTitle: "رسائی اور زبان",
    largerText: "بڑا متن",
    highContrast: "ہائی کنٹراسٹ",
    textToSpeech: "ٹیکسٹ ٹو اسپیچ",
    ttsSpeakPage: "اسکرین سنیں",
    ttsStop: "آواز روکیں",
    languageLabel: "زبان",
    helpCardTitle: "مدد چاہیے؟ اسٹڈی اسسٹنٹ حاضر ہے",
    helpCardBody: "لوپس یا فنکشنز میں مشکل ہو؟ فوری قدم بہ قدم رہنمائی حاصل کریں۔",
    chatNow: "رہنمائی لیں",
    searchPlaceholder: "کورسز یا موضوعات تلاش کریں...",
    simulateAbsence: "5 دن کا وقفہ آزمائیں",
    roles: {
      learner: "طالب علم",
      educator: "استاد",
      admin: "ایڈمن",
    },
    welcomeBack: "خوش آمدید، فہد!",
    heroSubtitle:
      "مختصر اسباق اور مؤثر مشق۔ جہاں چھوڑا تھا وہیں سے آسانی سے جاری رکھیں۔",
    resumeLearning: "سیکھنا جاری رکھیں",
    currentMasteryLabel: "آپ کی موجودہ مہارت",
    kpis: {
      overallProgress: "مجموعی پیش رفت",
      quizAccuracy: "کوئز کی درستگی",
      studyStreak: "مطالعہ تسلسل",
      studyStreakSub: "شاندار کارکردگی!",
      totalStudyTime: "کل مطالعہ کا وقت",
    },
    myCourses: "میرے کورسز",
    continueLearning: "جاری رکھیں",
    startCourse: "کورس شروع کریں",
    studyPlannerTitle: "روزانہ کا اسٹڈی پلان",
    studyPlannerSubtitle:
      "اپنا وقت منتخب کریں — ہم ترجیحی موضوعات کے مطابق سیشن تیار کریں گے۔",
    startSession: "سیشن شروع کریں",
    adaptiveTopicMastery: "مہارت کا جائزہ",
    learningProgressTitle: "آپ کی سیکھنے کی پیش رفت",
    thisWeek: "اس ہفتے",
    lastWeek: "پچھلے ہفتے",
    recentActivity: "حالیہ سرگرمی",
    achievementTitle: "بہترین پیش رفت!",
    achievementBody:
      "روزانہ کے مختصر سیشنز کی بدولت پائتھون کے بنیادی موضوعات میں آپ کی مہارت +12% بڑھی ہے۔",
    viewProgress: "پیش رفت دیکھیں",
    practiceTitle: "ہدف شدہ مشق",
    practiceSubtitle:
      "اہم تصورات جیسے Loops اور Functions کو پختہ بنانے کے لیے انٹرایکٹو سوالات۔",
    submitAnswer: "جواب جمع کرائیں",
    nextQuestion: "اگلا سوال",
    readAloud: "بلند آواز میں سنیں",
    aiFeedbackTitle: "قدم بہ قدم وضاحت",
  },
  roman_ur: {
    brandTagline: "Seekhein · Mashq Karein · Maharat Payein",
    nav: {
      dashboard: "Dashboard",
      courses: "Mere Courses",
      practice: "Practice",
      planner: "Study Planner",
      progress: "Meri Progress",
      feedback: "Review & Notes",
      resources: "Resources",
      settings: "Settings",
    },
    accessibilityTitle: "Accessibility aur Zaban",
    largerText: "Bara Text",
    highContrast: "High Contrast",
    textToSpeech: "Text-to-Speech",
    ttsSpeakPage: "Screen Sunein",
    ttsStop: "Audio Rokein",
    languageLabel: "Zaban (Language)",
    helpCardTitle: "Madad chahiye? Study Assistant yahan hai",
    helpCardBody: "Loops ya Functions samajhne mein mushkil hai? Step-by-step madad lein.",
    chatNow: "Madad Lein",
    searchPlaceholder: "Courses ya topics search karein...",
    simulateAbsence: "5-Din Break Test Karein",
    roles: {
      learner: "Learner",
      educator: "Educator",
      admin: "Admin",
    },
    welcomeBack: "Khush amdeed, Fahad!",
    heroSubtitle:
      "Chhote lessons aur asaan practice. Jahan chhora tha wahin se dobara shuru karein.",
    resumeLearning: "Seekhna Jari Rakhein",
    currentMasteryLabel: "Aapki maujooda maharat",
    kpis: {
      overallProgress: "Kul Progress",
      quizAccuracy: "Quiz Accuracy",
      studyStreak: "Study Streak",
      studyStreakSub: "Zabardast raftaar!",
      totalStudyTime: "Kul Study Waqt",
    },
    myCourses: "Mere Courses",
    continueLearning: "Jari Rakhein",
    startCourse: "Course Shuru Karein",
    studyPlannerTitle: "Daily Study Plan",
    studyPlannerSubtitle:
      "Apna waqt select karein — hum priority topics ke hisab se session arrange karenge.",
    startSession: "Session Shuru Karein",
    adaptiveTopicMastery: "Skill Mastery",
    learningProgressTitle: "Aapki Learning Progress",
    thisWeek: "Is Hafte",
    lastWeek: "Pichle Hafte",
    recentActivity: "Haliya Sargarmi",
    achievementTitle: "Aap bohot acha kar rahe hain!",
    achievementBody:
      "Chhote daily sessions ki wajah se Python concepts mein aapki grip +12% barhi hai.",
    viewProgress: "Progress Dekhein",
    practiceTitle: "Targeted Practice",
    practiceSubtitle:
      "Loops aur Functions jaise ahem concepts ko mazboot karne ke liye interactive sawalat.",
    submitAnswer: "Jawab Submit Karein",
    nextQuestion: "Agla Sawal",
    readAloud: "Buland Awaz Mein Sunein",
    aiFeedbackTitle: "Step-by-Step Explanation",
  },
};
