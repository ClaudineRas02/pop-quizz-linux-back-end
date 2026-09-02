export const AUTO_ROUND_BUCKETS = [
  {
    key: "easy",
    ratio: 1 / 4,
    whereSql:
      "difficulty = 'easy' AND category = 'culture_generale'::public.question_category AND type = 'multiple_choice'::public.question_type",
    roundNumber: 1,
  },
  {
    key: "medium",
    ratio: 2 / 4,
    whereSql:
      "difficulty = 'medium' AND category = 'linux_command'::public.question_category AND type = 'multiple_choice'::public.question_type",
    roundNumber: 2,
  },
  {
    key: "hard",
    ratio: 1 / 4,
    whereSql:
      "difficulty = 'hard' AND type = 'multiple_choice'::public.question_type",
    roundNumber: 3,
  },
];
