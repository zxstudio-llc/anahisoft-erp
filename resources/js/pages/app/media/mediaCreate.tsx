import { useState, useMemo } from 'react'
import { Head, router } from '@inertiajs/react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

import type { MediaResponse } from '@/types/mediaInterface'

interface Props {
  media: MediaResponse
}

interface CustomPropertyItem {
  key: string
  value: string
}

interface MediaForm {
  name: string
  custom_properties: CustomPropertyItem[]
}

export default function Create({ media }: Props) {
  const [form, setForm] = useState<MediaForm>({
    name: '',
    custom_properties: []
  })

  const [newProperty, setNewProperty] = useState<CustomPropertyItem>({
    key: '',
    value: ''
  })

  const [collectionName, setCollectionName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isNewCollection, setIsNewCollection] = useState(false)

  const existingCollections = useMemo(() => {
    const defaultCollections = ['default', 'unattached', 'page']
    const set = new Set(defaultCollections)

    media?.data?.forEach(item => {
      if (item.collection_name) {
        set.add(item.collection_name)
      }
    })

    return Array.from(set)
  }, [media])

  const handleAddProperty = () => {
    if (newProperty.key.trim() && newProperty.value.trim()) {
      setForm(prev => ({
        ...prev,
        custom_properties: [...prev.custom_properties, newProperty]
      }))
      setNewProperty({ key: '', value: '' })
    }
  }

  const handleSubmit = () => {
    if (!file || !form.name.trim() || !collectionName.trim()) {
      setUploadError('Todos los campos son obligatorios.')
      return
    }

    setIsUploading(true)
    setUploadSuccess(false)
    setUploadError(null)

    const data = new FormData()
    data.append('file', file)
    data.append('name', form.name)
    data.append('collection_name', collectionName)
    data.append('custom_properties', JSON.stringify(form.custom_properties))

    router.post('/admin/media', data, {
      forceFormData: true,
      onSuccess: () => {
        setUploadSuccess(true)
        setForm({ name: '', custom_properties: [] })
        setFile(null)
        setCollectionName('')
        setIsNewCollection(false)
      },
      onError: () => {
        setUploadError('Hubo un error al subir el archivo.')
      },
      onFinish: () => setIsUploading(false)
    })
  }

  return (
    <>
      <Head title="Subir media" />
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="file">Archivo</Label>
          <Input
            type="file"
            id="file"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <Label>Colección</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {collectionName || 'Seleccionar colección'}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Colecciones existentes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {existingCollections.map(col => (
                <DropdownMenuItem
                  key={col}
                  onSelect={() => {
                    setCollectionName(col)
                    setIsNewCollection(false)
                  }}
                >
                  {col}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsNewCollection(true)}>
                Nueva colección...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isNewCollection && (
            <Input
              className="mt-2"
              placeholder="Nombre de nueva colección"
              value={collectionName}
              onChange={e => setCollectionName(e.target.value)}
            />
          )}
        </div>

        <div>
          <Label>Propiedades personalizadas</Label>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Clave"
              value={newProperty.key}
              onChange={e =>
                setNewProperty({ ...newProperty, key: e.target.value })
              }
            />
            <Input
              placeholder="Valor"
              value={newProperty.value}
              onChange={e =>
                setNewProperty({ ...newProperty, value: e.target.value })
              }
            />
            <Button onClick={handleAddProperty}>Agregar</Button>
          </div>
          <ul className="list-disc ml-6 mt-2 text-sm text-muted-foreground">
            {form.custom_properties.map((prop, idx) => (
              <li key={idx}>
                <strong>{prop.key}</strong>: {prop.value}
              </li>
            ))}
          </ul>
        </div>

        <Button onClick={handleSubmit} disabled={isUploading}>
          {isUploading ? 'Subiendo...' : 'Subir'}
        </Button>

        {uploadSuccess && (
          <div className="text-green-600 font-medium mt-2">
            Archivo subido exitosamente.
          </div>
        )}
        {uploadError && (
          <div className="text-red-600 font-medium mt-2">{uploadError}</div>
        )}
      </div>
    </>
  )
}
