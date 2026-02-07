export type LessonId = string;

export type QuestionType =
  | "multiple_choice"
  | "single_choice"
  | "fill_blank"
  | "short_answer"
  | "listening"
  | "true_false";

export type QuestionOption = {
  id: string;
  label: string;
};

export type LessonQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: QuestionOption[];
};

export type Media = {
  url: string | null;
};

export type LessonSummary = {
  id: LessonId;
  title: string;
  description?: string;
  stage?: number;
  questionCount?: number;

  backgroundUrl?: string | null;
  mascotUrl?: string | null;
};

export type LessonPreview = {
  id: LessonId;
  title: string;
  description?: string;
  questionCount: number;
};

export type LessonInfo = {
  id: LessonId;
  title: string;
  description?: string;
  questionCount?: number;
};
