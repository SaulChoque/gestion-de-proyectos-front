'use client'

import { useState, useMemo, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Avatar } from '@/components/ui/Avatar'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { useAuth, ROLE_LABELS, ROLE_OPTIONS, ROLE_COLORS, type AppUser, type UserRole } from '@/features/auth-users'

export default function UsuariosPage() {
  const { getUsers, updateUser, user: currentUser } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' as UserRole | '', hourlyRate: 0 })

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const result = await getUsers()
      setUsers(result)
      setIsLoading(false)
    }
    load()
  }, [getUsers])

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchesRole = !roleFilter || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  const openEdit = (user: AppUser) => {
    setEditingUser(user)
    setEditForm({ name: user.name, email: user.email, role: user.role, hourlyRate: user.hourlyRate })
  }

  const saveEdit = async () => {
    if (!editingUser) return
    await updateUser(editingUser.id, {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role as UserRole,
      hourlyRate: editForm.hourlyRate,
    })
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role as UserRole, hourlyRate: editForm.hourlyRate }
          : u,
      ),
    )
    setEditingUser(null)
  }

  const toggleActive = async (user: AppUser) => {
    await updateUser(user.id, { isActive: !user.isActive })
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)))
  }

  const isAdmin = currentUser?.role === 'admin'

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Personnel Administration</h1>
          <p className="text-sm text-slate-500">Manage hourly rates, roles, and access permissions</p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="w-64">
            <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="w-48">
            <Select options={ROLE_OPTIONS} placeholder="All roles" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} />
          </div>
          <div className="ml-auto text-sm text-slate-500">
            {isLoading ? 'Loading...' : `${users.length} user${users.length !== 1 ? 's' : ''}`}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="py-12 text-center text-slate-400">No users found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-700">${user.hourlyRate.toFixed(2)}/hr</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'success' : 'secondary'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(user)}>Edit</Button>
                            <Button variant={user.isActive ? 'destructive' : 'secondary'} size="sm" onClick={() => toggleActive(user)}>
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null) }}>
        {editingUser && (
          <>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update hourly rate and role assignment</DialogDescription>
            </DialogHeader>
            <DialogContent className="space-y-4">
              <Input label="Full name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <Select label="Role" options={ROLE_OPTIONS} value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })} />
              <Input label="Hourly Rate ($)" type="number" min="0" step="0.5" value={editForm.hourlyRate} onChange={(e) => setEditForm({ ...editForm, hourlyRate: parseFloat(e.target.value) || 0 })} />
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save changes</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  )
}
