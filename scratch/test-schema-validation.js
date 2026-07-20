const { z } = require('zod')

const assignmentSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(3).max(2000),
  type: z.enum(['tp', 'exam', 'project']),
  formationId: z.coerce.number().int().positive(),
  sessionId: z.coerce.number().int().positive(),
  deadline: z.string().min(10),
  maxFileSize: z.coerce.number().int().min(1).max(100).default(10),
  allowedFileTypes: z.array(z.string().trim().min(1).max(20)).max(12).optional(),
  instructions: z.string().trim().max(5000).optional(),
  status: z.enum(['brouillon', 'publie', 'archive']).optional().default('publie'),
  publishDate: z.string().optional(),
  files: z.array(z.object({
    name: z.string(),
    originalName: z.string(),
    size: z.number(),
    url: z.string()
  })).optional()
})

const testPayloads = [
  // 1. Valid payload
  {
    title: 'TP 1 - Algorithmes',
    description: 'Faire des algos',
    type: 'tp',
    formationId: 4,
    sessionId: 13,
    deadline: new Date().toISOString(),
    allowedFileTypes: ['pdf', 'docx']
  },
  // 2. Missing sessionId
  {
    title: 'TP 1 - Algorithmes',
    description: 'Faire des algos',
    type: 'tp',
    formationId: 4,
    deadline: new Date().toISOString()
  },
  // 3. Null sessionId (e.g. from NaN parsed value)
  {
    title: 'TP 1 - Algorithmes',
    description: 'Faire des algos',
    type: 'tp',
    formationId: 4,
    sessionId: null,
    deadline: new Date().toISOString()
  },
  // 4. Undefined / Empty publishDate
  {
    title: 'TP 1 - Algorithmes',
    description: 'Faire des algos',
    type: 'tp',
    formationId: 4,
    sessionId: 13,
    deadline: new Date().toISOString(),
    publishDate: ''
  }
]

for (const [idx, p] of testPayloads.entries()) {
  console.log(`--- Test ${idx + 1} ---`)
  const result = assignmentSchema.safeParse(p)
  if (result.success) {
    console.log('Success!', result.data)
  } else {
    console.log('Failed:', result.error.flatten())
  }
}
