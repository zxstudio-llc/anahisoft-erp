import { Head, useForm } from '@inertiajs/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import AppLayout from '@/layouts/app-layout'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface Permission {
  id: number
  name: string
  description: string
}

interface PermissionGroup {
  group: string
  permissions: Permission[]
}

interface CreateRoleProps {
  permissionsByGroup: PermissionGroup[]
  guards: string[]
}

interface BreadcrumbItem {
  title: string
  href: string
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard' },
  { title: 'Roles', href: '/admin/roles' },
  { title: 'Crear rol', href: '/admin/roles/create' }
]

export default function Create({ permissionsByGroup, guards }: CreateRoleProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    guard_name: guards[0] ?? 'web',
    permissions: [] as string[],
    is_admin_role: false,
  })

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const togglePermission = (perm: string) => {
    setData(
      'permissions',
      data.permissions.includes(perm)
        ? data.permissions.filter(p => p !== perm)
        : [...data.permissions, perm]
    )
  }

  const toggleGroupPermissions = (group: PermissionGroup) => {
    const groupPermissions = group.permissions.map(p => p.name)
    const allSelected = groupPermissions.every(perm => data.permissions.includes(perm))
    
    if (allSelected) {
      // Deseleccionar todos los permisos del grupo
      setData('permissions', data.permissions.filter(perm => !groupPermissions.includes(perm)))
    } else {
      // Seleccionar todos los permisos del grupo
      const newPermissions = [...data.permissions]
      groupPermissions.forEach(perm => {
        if (!newPermissions.includes(perm)) {
          newPermissions.push(perm)
        }
      })
      setData('permissions', newPermissions)
    }
  }

  const selectAll = () => {
    const all = permissionsByGroup.flatMap(g => g.permissions.map(p => p.name))
    setData('permissions', all)
  }

  const deselectAll = () => {
    setData('permissions', [])
  }

  const expandAll = () => {
    const expanded = permissionsByGroup.reduce((acc, group) => {
      acc[group.group] = true
      return acc
    }, {} as Record<string, boolean>)
    setExpandedGroups(expanded)
  }

  const collapseAll = () => {
    setExpandedGroups({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('admin.roles.store'))
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear nuevo rol" />
      <form onSubmit={handleSubmit} className="space-y-8 px-4 py-6">
        <h1 className="text-2xl font-semibold">Crear rol</h1>

        <Card>
          <CardContent className="flex justify-between items-center pt-6">
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  placeholder="Nombre del rol"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  placeholder="Descripción del rol"
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label>Guard</Label>
                <Select
                  value={data.guard_name}
                  onValueChange={value => setData('guard_name', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un guard" />
                  </SelectTrigger>
                  <SelectContent>
                    {guards.map(guard => (
                      <SelectItem key={guard} value={guard}>
                        {guard}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Label htmlFor="is_admin_role">Es administrador</Label>
              <Switch
                id="is_admin_role"
                checked={data.is_admin_role}
                onCheckedChange={value => setData('is_admin_role', !!value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Permisos</h2>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={expandAll}>
                  Expandir todos
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={collapseAll}>
                  Contraer todos
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                  Seleccionar todos
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
                  Deseleccionar todos
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissionsByGroup.map(group => {
                const isExpanded = expandedGroups[group.group]
                const groupPermissions = group.permissions.map(p => p.name)
                const selectedCount = groupPermissions.filter(perm => data.permissions.includes(perm)).length
                const totalCount = groupPermissions.length
                const allSelected = selectedCount === totalCount
                const someSelected = selectedCount > 0 && selectedCount < totalCount

                return (
                  <Card key={group.group} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.group)}
                            className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="capitalize">{group.group.replace('_', ' ')}</span>
                          </button>
                          <span className="text-xs text-muted-foreground">
                            ({selectedCount}/{totalCount})
                          </span>
                        </div>
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => toggleGroupPermissions(group)}
                          className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                        />
                      </div>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {group.permissions.map(perm => (
                            <div key={perm.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`perm-${perm.id}`}
                                checked={data.permissions.includes(perm.name)}
                                onCheckedChange={() => togglePermission(perm.name)}
                              />
                              <Label 
                                htmlFor={`perm-${perm.id}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {perm.description}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={processing}>
            Crear rol
          </Button>
        </div>
      </form>
    </AppLayout>
  )
}