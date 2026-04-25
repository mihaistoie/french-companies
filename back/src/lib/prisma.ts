import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";
import { addCalculatedNoteToMany } from "./rse-scoring";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const basePrisma = new PrismaClient({ adapter });

const rseScoreModels = new Set([
  "EvaluationRse",
  "LabelsEngagementsRse",
  "IndicateursEnvironnementaux",
  "IndicateursSociaux",
  "IndicateursGouvernanceRse",
]);

function withCalculatedNote(args: any) {
  if (!args?.data) {
    return args;
  }

  if (Array.isArray(args.data) || "score" in args.data) {
    return {
      ...args,
      data: addCalculatedNoteToMany(args.data),
    };
  }

  if (args.data.create && (Array.isArray(args.data.create) || "score" in args.data.create)) {
    return {
      ...args,
      data: {
        ...args.data,
        create: addCalculatedNoteToMany(args.data.create),
      },
    };
  }

  if (args.data.update && "score" in args.data.update) {
    return {
      ...args,
      data: {
        ...args.data,
        update: addCalculatedNoteToMany(args.data.update),
      },
    };
  }

  return args;
}

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      $allOperations({ model, operation, args, query }) {
        if (
          model &&
          rseScoreModels.has(model) &&
          ["create", "createMany", "createManyAndReturn", "update", "updateMany", "updateManyAndReturn", "upsert"].includes(operation)
        ) {
          return query(withCalculatedNote(args));
        }

        return query(args);
      },
    },
  },
});
