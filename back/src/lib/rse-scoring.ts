import { EvaluationRseNote } from "@prisma/client";

type ScoreCarrier = {
  score?: unknown;
  note?: unknown;
};

export function calculerNote(score: number): EvaluationRseNote {
  return score === 1
    ? EvaluationRseNote.F
    : score < 2
      ? EvaluationRseNote.E
      : score < 3
        ? EvaluationRseNote.D
        : score < 4
          ? EvaluationRseNote.C
          : score < 4.5
            ? EvaluationRseNote.B
            : EvaluationRseNote.A;
}

export function addCalculatedNote<T extends ScoreCarrier>(data: T): T {
  if (data.score === undefined) {
    return data;
  }

  return {
    ...data,
    note: calculerNote(Number(data.score)),
  };
}

export function addCalculatedNoteToMany<T extends ScoreCarrier | ScoreCarrier[]>(
  data: T,
): T {
  if (Array.isArray(data)) {
    return data.map((item) => addCalculatedNote(item)) as T;
  }

  return addCalculatedNote(data) as T;
}
