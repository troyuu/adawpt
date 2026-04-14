import { useState } from 'react'
import {
  Search,
  Users,
  Edit2,
  Shield,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatShortDate } from '../../lib/utils.js'
import api from '../../api/client.js'
import { useToast } from '../../components/ui/Toast.jsx'
import Button from '../../components/ui/Button.jsx'
import Select from '../../components/ui/Select.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

const roleFilterOptions = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
]

const roleEditOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
]

const roleBadgeVariant = {
  admin: 'danger',
  user: 'primary',
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-8" />
        </div>
      ))}
    </div>
  )
}

export default function UsersManagement() {
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editModal, setEditModal] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const params = {
    page,
    page_size: pageSize,
    search: search || undefined,
    role: roleFilter || undefined,
  }
  const { data, loading, error, refetch } = useApi('/api/v1/users/', { params })

  const users = data?.data?.results || []
  const totalPages = data?.data?.total_pages || 1
  const totalCount = data?.data?.count || 0

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  function openEditModal(user) {
    setEditModal(user)
    setSelectedRole(user.role)
  }

  async function handleRoleUpdate() {
    if (!editModal || !selectedRole) return
    setActionLoading(true)
    setActionError(null)
    try {
      await api.patch(`/api/v1/users/${editModal.id}/`, { role: selectedRole })
      setEditModal(null)
      refetch()
      addToast({ message: 'User role updated successfully.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update user role.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users and their roles</p>
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
        <Select
          options={roleFilterOptions}
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="sm:w-44"
        />
      </Card>

      {actionError && (
        <Alert variant="error" onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {/* Table */}
      <Card className="overflow-x-auto">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <Alert variant="error">{error}</Alert>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Adjust your search or filter to find users."
          />
        ) : (
          <>
            <table className="w-full text-sm text-left hidden md:table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">User</th>
                  <th className="pb-3 font-medium text-gray-500">Role</th>
                  <th className="pb-3 font-medium text-gray-500">Joined</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar}
                          name={`${user.first_name} ${user.last_name}`}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={roleBadgeVariant[user.role] || 'default'}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-600">
                      {formatShortDate(user.date_joined)}
                    </td>
                    <td className="py-3">
                      <Badge variant={user.is_active ? 'success' : 'default'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          aria-label={`Edit ${user.first_name} ${user.last_name}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={user.avatar}
                      name={`${user.first_name} ${user.last_name}`}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <Badge variant={roleBadgeVariant[user.role] || 'default'}>
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role}
                        </Badge>
                        <Badge variant={user.is_active ? 'success' : 'default'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors shrink-0"
                    aria-label={`Edit ${user.first_name} ${user.last_name}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={handlePageSizeChange} totalCount={totalCount} />
            </div>
          </>
        )}
      </Card>

      {/* Edit role modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit User Role"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate} loading={actionLoading}>
              Save Changes
            </Button>
          </>
        }
      >
        {editModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar
                src={editModal.avatar}
                name={`${editModal.first_name} ${editModal.last_name}`}
                size="md"
              />
              <div>
                <p className="font-medium text-gray-900">
                  {editModal.first_name} {editModal.last_name}
                </p>
                <p className="text-xs text-gray-500">{editModal.email}</p>
              </div>
            </div>
            <Select
              label="Role"
              options={roleEditOptions}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
