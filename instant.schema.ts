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
    }),
    appointments: i.entity({
      userId: i.string().indexed(),
      doctor: i.string(),
      specialty: i.string(),
      date: i.string().indexed(), // ISO date string (YYYY-MM-DD) for sorting/filtering
      time: i.string(), // e.g., "10:00 AM"
      location: i.string(),
      address: i.string().optional(),
      notes: i.string().optional(), // Purpose of visit, etc.
      type: i.string().indexed(), // e.g., "physical", "followup", "checkup"
      status: i.string().indexed(), // e.g., "upcoming", "completed", "cancelled"
      summary: i.string().optional(), // For past appointments
    }),
    healthNotes: i.entity({
      userId: i.string().indexed(),
      title: i.string(),
      content: i.string(),
      tags: i.json().optional(),
      createdAt: i.number().optional(),
      updatedAt: i.number().optional(),
    }),
    labReports: i.entity({
      userId: i.string().indexed(),
      originalFileName: i.string(),
      status: i.string().indexed(), // "uploading", "processing", "completed", "error"
      aiSummary: i.string().optional(),
      aiTranscription: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
  },
  links: {
    labReportFile: {
      forward: { on: 'labReports', has: 'one', label: 'file' },
      reverse: { on: '$files', has: 'one', label: 'labReport' },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema { }
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
