export const AUTO_ROUND_BUCKETS = [
  {
    key: "culture_generale_qcm",
    ratio: 2 / 8,
    whereSql:
      "category = 'culture_generale'::public.question_category AND type = 'multiple_choice'::public.question_type",
    roundNumber: 1,
  },
  {
    key: "linux_qcm",
    ratio: 2 / 8,
    whereSql:
      "category = 'linux'::public.question_category AND type = 'multiple_choice'::public.question_type",
    roundNumber: 2,
  },
  {
    key: "linux_command",
    ratio: 2 / 8,
    whereSql:
      "category = 'linux'::public.question_category AND type = 'command'::public.question_type",
    roundNumber: 2,
  },
  {
    key: "linux_combination",
    ratio: 1 / 8,
    whereSql:
      "category = 'linux'::public.question_category AND type = 'combination'::public.question_type",
    roundNumber: 2,
  },
  {
    key: "linux_fill_blank",
    ratio: 1 / 8,
    whereSql:
      "category = 'linux'::public.question_category AND type = 'fill_blank'::public.question_type",
    roundNumber: 2,
  },
];
