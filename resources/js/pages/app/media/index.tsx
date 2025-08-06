import { Head, usePage, router } from '@inertiajs/react'
import { PageProps } from '@/types'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from "sonner"
import { MoreVertical, Trash2, Upload, Image, RefreshCw, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatBytes } from '@/lib/utils'
import AppLayout from '@/layouts/app-layout'

export default function MediaIndex({ auth, media, filters }: PageProps<{ media: any, filters: any }>) {
  const [activeTab, setActiveTab] = useState(filters.trashed === 'only' ? 'trash' : 'gallery')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)
  const [files, setFiles] = useState<File[]>([])
  const [name, setName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [externalUrl, setExternalUrl] = useState('')
  const [collectionName, setCollectionName] = useState('')
  const [modelType, setModelType] = useState('')
  const [modelId, setModelId] = useState('')
  const [customProperties, setCustomProperties] = useState('{}')
  
  // Separar medios activos y eliminados
  const activeMedia = media.data.filter((item: any) => !item.deleted_at)
  const trashedMedia = media.data.filter((item: any) => item.deleted_at)

  useEffect(() => {
    const trashedFilter = activeTab === 'trash' ? 'only' : 'without';
    router.get(route('admin.media.index'), { 
        ...filters,
        trashed: trashedFilter
    }, { preserveState: true });
}, [activeTab]);

const handleTabChange = (tab) => {
    const trashedValue = tab === 'trash' ? 'only' : 'without';
    
    // Envía solo el parámetro trashed, no todos los filters
    router.get(route('admin.media.index'), { 
        trashed: trashedValue 
    }, { 
        preserveState: true,
        replace: true  // Esto evita acumular historial de navegación
    });
    
    setActiveTab(tab);
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([e.target.files[0]]); // Only keep the first file
    }
  }

  const removeFile = () => {
    setFiles([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
  
    try {
      const formData = new FormData()
  
      if (files.length > 0) {
        formData.append('file', files[0], files[0].name)
      }
  
      if (externalUrl.trim()) {
        formData.append('external_url', externalUrl)
      }
  
      formData.append('collection_name', collectionName)
      formData.append('model_type', modelType)
      formData.append('model_id', modelId)
      formData.append('custom_properties', customProperties)
  
      await router.post(route('admin.media.store'), formData, {
        forceFormData: true,
        onSuccess: () => {
          toast.success('Media uploaded successfully')
          setShowUploadModal(false)
          resetForm()
        },
        onError: (errors) => {
          toast.error('Failed to upload media', {
            description: Object.values(errors).join('\n')
          })
        }
      })
    } finally {
      setIsUploading(false)
    }
  }  

  const resetForm = () => {
    setFiles([])
    setExternalUrl('')
    setCollectionName('')
    setModelType('')
    setModelId('')
    setCustomProperties('{}')
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await router.put(route('admin.media.update', selectedMedia.id), { name }, {
      onSuccess: () => {
        toast.success('Media updated successfully')
        setShowEditModal(false)
      },
      onError: () => {
        toast.error('Failed to update media')
      }
    })
  }

  const handleDelete = async () => {
    await router.delete(route('admin.media.destroy', selectedMedia.id), {
      onSuccess: () => {
        toast.success('Media moved to trash')
        setShowDeleteModal(false)
      },
      onError: () => {
        toast.error('Failed to move media to trash')
      }
    })
  }

  const handleRestore = async (id: string) => {
    await router.post(route('admin.media.restore', id), {}, {
        onSuccess: () => {
            toast.success('Media restored');
            router.visit(route('admin.media.index', {
                trashed: 'only'
            }), {
                preserveState: true,
                only: ['media'],
                onFinish: () => {
                    window.scrollTo(0, 0);
                }
            });
        },
        onError: () => {
            toast.error('Failed to restore media');
        }
    });
  };

  const handleForceDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar permanentemente este archivo?')) {
        return;
    }

    await router.delete(route('admin.media.forceDelete', id), {
        onSuccess: () => {
            toast.success('Media permanently deleted');
            router.visit(route('admin.media.index', {
                trashed: 'only'
            }), {
                preserveState: true,
                only: ['media'],
                onFinish: () => {
                    window.scrollTo(0, 0);
                }
            });
        },
        onError: () => {
            toast.error('Failed to delete media permanently');
        }
    });
};

  const isFormValid = () => {
    return (files.length > 0 || externalUrl.trim() !== '') && collectionName.trim() !== ''
  }

  const handleSearch = (value: string) => {
    router.get(route('admin.media.index'), { 
      search: value,
      trashed: activeTab === 'trash' ? 'only' : 'without'
    }, { preserveState: true })
  }

  return (
    <AppLayout>
      <Head title="Media Library" />

      <div className="py-4">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card className="overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <div className="flex items-center justify-between w-full">
                    <TabsList>
                      <TabsTrigger value="gallery">Gallery</TabsTrigger>
                      <TabsTrigger value="trash">Trash</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center space-x-4">
                    <Input
                    placeholder="Search media..."
                    value={filters.search || ''}
                    onChange={(e) => router.get(route('admin.media.index'), { 
                        ...filters,
                        search: e.target.value,
                        trashed: activeTab === 'trash' ? 'only' : 'without'
                    }, { preserveState: true })}
                    className="max-w-sm"
                    />
                      <Button onClick={() => setShowUploadModal(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="gallery">
                    <div className="mt-4 rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Preview</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeMedia.length > 0 ? (
                            activeMedia.map((item: any) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div className="w-16 h-16 rounded-md overflow-hidden border">
                                    {item.mime_type?.startsWith('image/') ? (
                                      <img
                                        src={item.thumbnail || item.original_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <Image className="h-8 w-8 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{formatBytes(item.size)}</TableCell>
                                <TableCell>{item.mime_type}</TableCell>
                                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedMedia(item)
                                          setName(item.name)
                                          setShowEditModal(true)
                                        }}
                                      >
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedMedia(item)
                                          setShowDeleteModal(true)
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No media found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="trash">
                    <div className="mt-4 rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Preview</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Deleted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trashedMedia.length > 0 ? (
                            trashedMedia.map((item: any) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div className="w-16 h-16 rounded-md overflow-hidden border">
                                    {item.mime_type?.startsWith('image/') ? (
                                      <img
                                        src={item.thumbnail || item.original_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <Image className="h-8 w-8 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{formatBytes(item.size)}</TableCell>
                                <TableCell>{item.mime_type}</TableCell>
                                <TableCell>{new Date(item.deleted_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleRestore(item.id)}
                                      >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Restore
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleForceDelete(item.id)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Permanently
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                Trash is empty
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Pagination */}
                {media.links && media.links.length > 3 && (
                  <div className="mt-4 flex items-center justify-end space-x-2">
                    {media.links.map((link: any, index: number) => (
                      <Button
                        key={index}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => link.url && router.get(link.url, { 
                          ...filters,
                          trashed: activeTab === 'trash' ? 'only' : 'without'
                        }, { preserveState: true })}
                        disabled={!link.url}
                      >
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Select a file to upload to your media library
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 max-w-sm">
              <div className="grid items-center gap-1.5">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                />
                {files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {files[0].name} ({formatBytes(files[0].size)})
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid items-center gap-1.5">
                <Label htmlFor="external_url">External URL (Alternative to file)</Label>
                <Input
                  id="external_url"
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com/media.jpg"
                />
              </div>

              <div className="grid items-center gap-1.5">
                <Label htmlFor="collection_name">Collection Name *</Label>
                <Select
                  value={collectionName}
                  onValueChange={setCollectionName}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="videos">Videos</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="thumbnails">Thumbnails</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid items-center gap-1.5">
                <Label htmlFor="model_type">Model Type (Optional)</Label>
                <Input
                  id="model_type"
                  type="text"
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  placeholder="e.g. App\\Models\\Post"
                />
              </div>

              <div className="grid items-center gap-1.5">
                <Label htmlFor="model_id">Model ID (Optional)</Label>
                <Input
                  id="model_id"
                  type="number"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  placeholder="123"
                />
              </div>

              <div className="grid items-center gap-1.5">
                <Label htmlFor="custom_properties">Custom Properties (JSON)</Label>
                <Input
                  id="custom_properties"
                  type="text"
                  value={customProperties}
                  onChange={(e) => setCustomProperties(e.target.value)}
                  placeholder='{"key": "value"}'
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={(files.length === 0 && externalUrl.trim() === '') || !collectionName || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
            <DialogDescription>
              Update the details for this media file
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action will move the media file to trash. You can restore it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}