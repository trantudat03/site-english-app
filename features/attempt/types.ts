export type AttemptId = string;

export type AttemptAnswerPayload =
  | { answerId: string }
  | { answer: string }
  | boolean;

export type AttemptAnswer = {
  questionId: string;
  response: AttemptAnswerPayload;
  timeSpent?: number;
};

export type AttemptResult = {
  attemptId: AttemptId;
  score?: number;
  passed?: boolean;
  details?: unknown;
};
