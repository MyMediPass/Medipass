// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed().optional(),
      url: i.any().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    profiles: i.entity({
      userId: i.string().unique().indexed(),
      firstName: i.string().optional(),
      lastName: i.string().optional(),
      email: i.string().optional(),
      phone: i.string().optional(),
      dob: i.string().optional(),
      gender: i.string().optional(),
      avatarUrl: i.string().optional(),
      darkMode: i.boolean().optional(),
      language: i.string().optional(),
      calendarSync: i.boolean().optional(),
      healthSync: i.boolean().optional(),
      notifications: i.boolean().optional(),
      // createdAt and updatedAt are automatically managed by InstantDB
    }),
    todos: i.entity({
      text: i.string(),
      done: i.boolean(),
      createdAt: i.number(),
    }),
    medications: i.entity({
      userId: i.string().indexed(), // To link medication to a user
      name: i.string(),
      dosage: i.string().optional(),
      frequency: i.string().optional(),
      time: i.string().optional(), // e.g., "08:00 AM"
      instructions: i.string().optional(),
      refillDate: i.string().optional(), // ISO date string
      status: i.string().optional().indexed(), // e.g., "active", "completed", "paused"
      pillsRemaining: i.number().optional(),
      totalPills: i.number().optional(),
      prescribedBy: i.string().optional(),
      startDate: i.string(), // ISO date string
      purpose: i.string().optional(),
      endDate: i.string().optional(), // ISO date string
      // createdAt and updatedAt are automatically managed by InstantDB
    }),
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema { }
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
