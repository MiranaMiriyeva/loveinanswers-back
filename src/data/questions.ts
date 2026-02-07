export type Question = { id: string; text: string; options: { id: string; label: string }[] };

export const QUESTIONS: Question[] = [
  { id: "q1", text: "First date üçün ideal yer?", options: [
    { id: "a", label: "Kafelər & desert" },
    { id: "b", label: "Gəzinti + dəniz havası" },
    { id: "c", label: "Kinoteatr" },
    { id: "d", label: "Ev + film + çay" },
  ]},
  { id: "q2", text: "Ən romantik sürpriz nədir?", options: [
    { id: "a", label: "Gözlənilməz məktub" },
    { id: "b", label: "Səfər planı" },
    { id: "c", label: "Hədiyyə qutusu" },
    { id: "d", label: "Birgə xatirə videosu" },
  ]},
  // ... buranı istədiyin qədər artıracaqsan
];
