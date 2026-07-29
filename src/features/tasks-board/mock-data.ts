import type { AppTask, AppComment, AppTimeEntry, AppAttachment } from './types'

export const initialTasks: AppTask[] = [
  { id: 1, title: 'Design landing page wireframes', description: 'Create low-fidelity wireframes for the new marketing landing page.', status: 'completed', priority: 'medium', assignee: 'Ana López', createdAt: '2026-07-10', dueDate: '2026-07-18', projectId: 1, estimatedHours: 8 },
  { id: 2, title: 'Implement user authentication flow', description: 'Build the complete sign-up, sign-in, and password-reset flow.', status: 'in-progress', priority: 'high', assignee: 'Carlos Ruiz', createdAt: '2026-07-12', dueDate: '2026-07-25', projectId: 1, estimatedHours: 16 },
  { id: 3, title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing, linting, and deployment.', status: 'todo', priority: 'high', assignee: 'María García', createdAt: '2026-07-14', dueDate: '2026-07-28', projectId: 1, estimatedHours: 12 },
  { id: 4, title: 'Create API documentation', description: 'Document all REST endpoints with request/response examples.', status: 'in-review', priority: 'low', assignee: 'Ana López', createdAt: '2026-07-08', dueDate: '2026-07-20', projectId: 1, estimatedHours: 6 },
  { id: 5, title: 'Build notification system', description: 'Implement real-time notifications for task assignments and comments.', status: 'todo', priority: 'medium', assignee: 'Carlos Ruiz', createdAt: '2026-07-15', dueDate: '2026-08-01', projectId: 2, estimatedHours: 20 },
  { id: 6, title: 'Design database schema for resources', description: 'Define the PostgreSQL schema for resource tracking.', status: 'completed', priority: 'high', assignee: 'María García', createdAt: '2026-07-05', dueDate: '2026-07-12', projectId: 2, estimatedHours: 10 },
  { id: 7, title: 'Integrate file upload for task attachments', description: 'Add drag-and-drop file upload zone in the task detail modal.', status: 'in-progress', priority: 'medium', assignee: 'Ana López', createdAt: '2026-07-13', dueDate: '2026-07-22', projectId: 1, estimatedHours: 8 },
  { id: 8, title: 'Generate monthly financial report PDF', description: 'Create a PDF export feature for financial dashboards.', status: 'in-review', priority: 'medium', assignee: 'Carlos Ruiz', createdAt: '2026-07-11', dueDate: '2026-07-24', projectId: 2, estimatedHours: 14 },
  { id: 9, title: 'Write unit tests for task hooks', description: 'Achieve >80% coverage on the useTasks custom hooks.', status: 'todo', priority: 'low', assignee: 'María García', createdAt: '2026-07-16', dueDate: '2026-07-30', projectId: 1, estimatedHours: 10 },
  { id: 10, title: 'Optimize Gantt chart rendering', description: 'Virtualize the timeline rows to handle 500+ tasks.', status: 'in-progress', priority: 'high', assignee: 'Carlos Ruiz', createdAt: '2026-07-14', dueDate: '2026-07-28', projectId: 2, estimatedHours: 12 },
]

export const initialComments: AppComment[] = [
  { id: 1, taskId: 2, author: 'Ana López', content: 'I have the sign-up UI ready. Working on the Supabase session persistence now.', createdAt: '2026-07-14T10:30:00Z' },
  { id: 2, taskId: 2, author: 'Carlos Ruiz', content: 'Great. Make sure to handle the token refresh edge case.', createdAt: '2026-07-14T11:15:00Z' },
  { id: 3, taskId: 4, author: 'María García', content: 'I have reviewed the auth endpoints docs. The examples are clear but we are missing the error response schemas.', createdAt: '2026-07-19T09:00:00Z' },
  { id: 4, taskId: 4, author: 'Ana López', content: 'Good catch. I will add the 401, 403, and 422 response examples this afternoon.', createdAt: '2026-07-19T09:45:00Z' },
  { id: 5, taskId: 7, author: 'Carlos Ruiz', content: 'The drag-and-drop zone is working. Need to wire up the actual upload call.', createdAt: '2026-07-15T14:20:00Z' },
  { id: 6, taskId: 7, author: 'María García', content: 'I can help with the storage bucket policy if you need it.', createdAt: '2026-07-15T15:00:00Z' },
  { id: 7, taskId: 8, author: 'Ana López', content: 'The PDF template looks good. Are we including the waterfall chart?', createdAt: '2026-07-20T08:30:00Z' },
  { id: 8, taskId: 10, author: 'María García', content: 'I profiled the current render and the bottleneck is the dependency-line SVG recalculations.', createdAt: '2026-07-16T16:45:00Z' },
]

export const initialTimeEntries: AppTimeEntry[] = [
  { id: 'te-001', taskId: 2, hours: 3.5, description: 'Set up Supabase Auth client and sign-up form', date: '2026-07-13' },
  { id: 'te-002', taskId: 2, hours: 2.0, description: 'Implement sign-in with email/password', date: '2026-07-14' },
  { id: 'te-003', taskId: 4, hours: 1.5, description: 'Document project list endpoint', date: '2026-07-10' },
  { id: 'te-004', taskId: 4, hours: 1.0, description: 'Review and edit auth endpoint docs', date: '2026-07-11' },
  { id: 'te-005', taskId: 7, hours: 4.0, description: 'Build file upload drop zone component', date: '2026-07-14' },
  { id: 'te-006', taskId: 10, hours: 2.5, description: 'Profile Gantt chart performance with React DevTools', date: '2026-07-15' },
  { id: 'te-007', taskId: 10, hours: 3.0, description: 'Implement windowed rendering for task rows', date: '2026-07-16' },
]

export const initialAttachments: AppAttachment[] = [
  { id: 'a-001', taskId: 2, name: 'auth-flow-diagram.png', size: 245_000, type: 'image/png', uploadedAt: '2026-07-13T15:00:00Z' },
  { id: 'a-002', taskId: 4, name: 'api-endpoints-v2.pdf', size: 120_000, type: 'application/pdf', uploadedAt: '2026-07-11T10:00:00Z' },
  { id: 'a-003', taskId: 7, name: 'screenshot-upload-zone.png', size: 512_000, type: 'image/png', uploadedAt: '2026-07-15T14:30:00Z' },
]
