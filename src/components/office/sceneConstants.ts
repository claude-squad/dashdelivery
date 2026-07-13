export const U = 0.28

// Agent positions in 3D world space (derived from SVG station % coords via svgToWorld)
export const STATIONS_3D: Record<string, { x: number; z: number; label: string }> = {
  pm:  { x: -1.44, z: -4.08, label: 'PM'  },
  tl:  { x:  1.44, z: -3.84, label: 'TL'  },
  dev: { x:  2.64, z: -1.44, label: 'DEV' },
  qa:  { x:  1.20, z:  0.96, label: 'QA'  },
  ux:  { x: -2.40, z:  0.48, label: 'UX'  },
  pe:  { x: -0.48, z:  2.16, label: 'PE'  },
  sec: { x: -3.84, z: -1.68, label: 'SEC' },
  rel: { x:  3.84, z:  0.96, label: 'REL' },
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
