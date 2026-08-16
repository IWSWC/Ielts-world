export type PublicCourse = {
  id: number;
  icon: string;
  title: string;
  description: string;
  tags: string;
  descriptionBn?: string;
  tagsBn?: string;
};

export type PublicOffer = {
  id: number;
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
};

export type PublicTeacher = {
  id: number;
  name: string;
  profession: string;
  organization: string | null;
  qualifications: string;
  experience: string;
  expertise: string;
  bio: string;
  achievements: string | null;
  hasPhoto: boolean;
};

export type PublicStudentStory = {
  id: number;
  name: string;
  program: string;
  destination: string | null;
  result: string | null;
  quote: string;
  hasPhoto: boolean;
};

export const defaultCourses: PublicCourse[] = [
  { id:1, icon:"🎯", title:"IELTS Preparation", description:"Complete Academic and General preparation across all four modules, with mock tests and personal feedback.", tags:"Regular · Weekend" },
  { id:2, icon:"⚡", title:"PTE Academic", description:"An intensive course featuring AI-scored practice, exam strategy and focused score improvement.", tags:"Practice Lab · Mock" },
  { id:3, icon:"🎓", title:"OIETC / ELLT", description:"Oxford International English Test preparation and application guidance for UK admission.", tags:"A1 to Advanced" },
  { id:4, icon:"💬", title:"Spoken English", description:"A practical course designed to build confidence in everyday and professional communication.", tags:"Beginner · Advanced" },
  { id:5, icon:"🇯🇵", title:"Japanese Language", description:"N5–N4 language training for learners planning to study or build a career in Japan.", tags:"N5 · N4" },
  { id:6, icon:"🇰🇷", title:"Korean Language", description:"A structured Korean communication programme for future study and work pathways.", tags:"Beginner · EPS" },
];

export const defaultOffers: PublicOffer[] = [
  { id:1, title:"Free Profile Assessment", description:"Get a realistic destination shortlist based on your academic results, language score and budget.", buttonLabel:"Start today", buttonHref:"#contact" },
];

export const defaultStudentStories: PublicStudentStory[] = [];
