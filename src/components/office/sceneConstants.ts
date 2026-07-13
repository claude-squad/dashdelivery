export const U = 0.28

// Agent positions in 3D world space — perimeter layout, meeting table clear at [0, 1.8]
export const STATIONS_3D: Record<string, { x: number; z: number; label: string }> = {
  pm:  { x: -3.0, z: -4.0, label: 'PM'  },  // north-west — product
  pe:  { x:  3.0, z: -4.0, label: 'PE'  },  // north-east — prompt eng
  tl:  { x:  4.5, z: -2.0, label: 'TL'  },  // east-north — tech lead
  dev: { x:  4.5, z:  1.0, label: 'DEV' },  // east-south — developer
  ux:  { x: -4.5, z: -2.0, label: 'UX'  },  // west-north — design
  sec: { x: -4.5, z:  1.0, label: 'SEC' },  // west-south — security
  qa:  { x: -1.5, z:  4.5, label: 'QA'  },  // south-west — quality
  rel: { x:  1.5, z:  4.5, label: 'REL' },  // south-east — release
}

export const STATUS_DOT_COLOR: Record<string, string> = {
  EXECUTING:       '#22c55e',
  RUNNING_TOOL:    '#7c6cf0',
  ANALYZING:       '#3b82f6',
  BLOCKED:         '#ef4444',
  FAILED:          '#ef4444',
  COMPLETED:       '#22c55e',
  QUEUED:          '#f59e0b',
  STARTING:        '#f59e0b',
  PLANNING:        '#3b82f6',
  WAITING_CONTEXT: '#f59e0b',
  VALIDATING:      '#3b82f6',
  CANCELLED:       '#6b7280',
  IDLE:            '#4b5563',
}

export const ACTIVE_STATUSES = new Set(['EXECUTING', 'RUNNING_TOOL', 'ANALYZING'])
export const BLOCKED_STATUSES = new Set(['BLOCKED', 'FAILED'])
