import Badge from './Badge'

const statusMap = {
  // General
  active: { variant: 'success', label: 'Active' },
  healthy: { variant: 'success', label: 'Healthy' },
  completed: { variant: 'success', label: 'Completed' },
  pending: { variant: 'warning', label: 'Pending' },
  'in-review': { variant: 'warning', label: 'In Review' },
  processing: { variant: 'warning', label: 'Processing' },
  reserved: { variant: 'primary', label: 'Reserved' },
  critical: { variant: 'danger', label: 'Critical' },
  urgent: { variant: 'danger', label: 'Urgent' },
  overdue: { variant: 'danger', label: 'Overdue' },
  archived: { variant: 'default', label: 'Archived' },
  inactive: { variant: 'default', label: 'Inactive' },
  draft: { variant: 'default', label: 'Draft' },
  info: { variant: 'info', label: 'Info' },

  // Animal statuses
  intake: { variant: 'default', label: 'Intake' },
  medical_evaluation: { variant: 'warning', label: 'Medical Evaluation' },
  treatment: { variant: 'warning', label: 'Treatment' },
  available: { variant: 'success', label: 'Available' },
  adoption_pending: { variant: 'info', label: 'Adoption Pending' },
  adopted: { variant: 'primary', label: 'Adopted' },
  fostered: { variant: 'info', label: 'Fostered' },
  transferred: { variant: 'default', label: 'Transferred' },
  deceased: { variant: 'danger', label: 'Deceased' },

  // Adoption statuses
  submitted: { variant: 'warning', label: 'Submitted' },
  under_review: { variant: 'info', label: 'Under Review' },
  interview_scheduled: { variant: 'primary', label: 'Interview Scheduled' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'danger', label: 'Rejected' },
  withdrawn: { variant: 'default', label: 'Withdrawn' },
  expired: { variant: 'default', label: 'Expired' },

  // Report statuses
  acknowledged: { variant: 'info', label: 'Acknowledged' },
  dispatched: { variant: 'warning', label: 'Dispatched' },
  rescued: { variant: 'success', label: 'Rescued' },
  sheltered: { variant: 'secondary', label: 'Sheltered' },
  closed: { variant: 'default', label: 'Closed' },

  // Report statuses (from original requirements — kept for compatibility)
  assigned: { variant: 'info', label: 'Assigned' },
  in_progress: { variant: 'warning', label: 'In Progress' },
  resolved: { variant: 'success', label: 'Resolved' },
  scheduled: { variant: 'info', label: 'Scheduled' },
}

export default function StatusBadge({ status, className }) {
  const normalized = status?.toLowerCase().trim()
  const config = statusMap[normalized] || { variant: 'default', label: status }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
