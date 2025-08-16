import * as React from "react"
import { Editor } from '@tiptap/core'
import { UploadCloud } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { Button } from '@/components/tiptap-ui-primitive/button'

interface ImageUploadButtonProps {
  editor: Editor | null
  onUpload?: (url: string) => void
  collectionName?: string
  modelType?: string
  modelId?: string | number
  className?: string
  children?: React.ReactNode
}

export function ImageUploadButton({ 
  editor, 
  onUpload, 
  collectionName = 'default',
  modelType,
  modelId,
  className = '',
  children
}: ImageUploadButtonProps) {
  const [isUploading, setIsUploading] = React.useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('collection_name', collectionName)
      
      if (modelType && modelId) {
        formData.append('model_type', modelType)
        formData.append('model_id', String(modelId))
      }

      const response = await axios.post('/admin/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Manejo mejorado de la respuesta
      let imageUrl = '';
      
      if (response.data?.data?.original_url) {
        imageUrl = response.data.data.original_url;
      } else if (response.data?.original_url) {
        imageUrl = response.data.original_url;
      } else if (response.data?.url) {
        imageUrl = response.data.url;
      } else if (response.data?.data?.url) {
        imageUrl = response.data.data.url;
      } else if (response.data?.file_url) {
        imageUrl = response.data.file_url;
      } else {
        console.error('Respuesta del servidor:', response.data);
        throw new Error('La estructura de la respuesta no es la esperada');
      }

      if (!imageUrl.startsWith('http')) {
        imageUrl = `${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      editor.chain()
        .focus()
        .setImage({ src: imageUrl })
        .run()

      if (onUpload) {
        onUpload(imageUrl)
      }

      toast.success('Imagen subida correctamente')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Error al subir la imagen'
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  if (!editor || !editor.isEditable) {
    return null
  }

  return (
    <div className="relative">
      <Button
        type="button"
        className={className.trim()}
        data-style="ghost"
        role="button"
        tabIndex={-1}
        aria-label="Subir imagen"
        tooltip="Subir imagen"
        disabled={isUploading}
      >
        {children || (
          <>
            <UploadCloud className="tiptap-button-icon" />
            {isUploading ? 'Subiendo...' : 'Subir imagen'}
          </>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading || !editor}
        />
      </Button>
    </div>
  )
}