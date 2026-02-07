import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

export const createUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const getUsersResponseSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  })
);

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export const updateUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const deleteUserResponseSchema = z.object({
  success: z.boolean(),
});

export const updateTimesByIdResponseSchema = z
  .array(
    z.object({
      rrule: z
        .object({
          freq: z.string().optional().openapi({ example: 'DAILY', description: 'Recurrence frequency' }),
          byweekday: z
            .array(z.number())
            .openapi({ example: [0, 1, 2, 6, 3], description: 'Days of week to repeat (0=Sunday)' }),
          exclude: z.array(z.string()).openapi({ example: ['2024-03-28T10:45:00.000Z'], description: 'Dates to skip' }),
        })
        .openapi({ description: 'Recurrence rule object' }),
      medication: z.string().optional().openapi({ example: '6152c5f3902e7f91374d9f75', description: 'Medication ObjectId' }),
      patient: z.string().openapi({ example: '614fb1d709dd9f6de85d6374', description: 'Patient ObjectId' }),
      date: z.string().openapi({ example: '2024-03-25T00:30:00.000Z', description: 'Scheduled date/time (ISO)' }),
      timeCategory: z.string().openapi({ example: 'noon', description: 'Time category (e.g. morning, noon)' }),
      amount: z.number().openapi({ example: 1, description: 'Dosage amount' }),
      emptyStomach: z.boolean().openapi({ example: false, description: 'Whether to take on empty stomach' }),
      instruction: z.string().optional().openapi({ example: '', description: 'Additional instructions' }),
      unit: z.string().optional().openapi({ example: 'St', description: 'Dosage unit' }),
      bake: z.boolean().openapi({ example: false, description: 'Baking flag (if applicable)' }),
      id: z.string().openapi({ example: '660079fd11fdc2dd935e43af', description: 'Entry identifier' }),
    })
  )
  .openapi({
    example: [
      {
        rrule: {
          freq: 'DAILY',
          byweekday: [0, 1, 2, 6, 3],
          exclude: ['2024-03-28T10:45:00.000Z'],
        },
        patient: '614fb1d709dd9f6de85d6374',
        date: '2024-03-25T00:30:00.000Z',
        timeCategory: 'noon',
        amount: 1,
        emptyStomach: false,
        instruction: '',
        unit: 'St',
        bake: false,
        id: '660079fd11fdc2dd935e43af',
      },
      // ...other items
    ],
    description: 'Array of updated time entries by ID',
  });
