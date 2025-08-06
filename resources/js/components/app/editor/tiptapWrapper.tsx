import { useEditor, EditorContent, EditorContext} from '@tiptap/react'
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Color } from '@tiptap/extension-color'
import { useEffect } from 'react'
import { EditorMenuBar } from './editorMenuBar'
import { EditorBubbleMenu } from './editorBubbleMenu'
import { BubbleMenu } from '@tiptap/react/menus'
import Heading from '@tiptap/extension-heading'
import HardBreak from '@tiptap/extension-hard-break'
// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"

import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'
import TrailingNode from '@/components/tiptap-extension/trailing-node-extension'
import { TextStyle } from '@tiptap/extension-text-style'

interface TiptapProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  imageCollection?: string
  modelType?: string
  modelId?: string | number
}

export function TiptapWrapper({ 
  content, 
  onChange, 
  placeholder = 'Escribe tu contenido aquí...',
  imageCollection = 'default',
  modelType,
  modelId
}: TiptapProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Superscript,
      Subscript,
      TrailingNode,
      Link.configure({ openOnClick: false }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Document, 
      Paragraph,
      Text, 
      TextStyle,
      HardBreak,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg border mx-auto',
        },
        inline: false,
        allowBase64: false,
      }),
      Link.configure({ 
        openOnClick: false
      }),
      Youtube.configure({
        inline: false,
        controls: true,
        HTMLAttributes: {
          class: 'youtube-iframe',
        },
        addPasteHandler: true,
        allowFullscreen: true,
        nocookie: true,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'paragraph') {
            return placeholder || 'Escribe tu contenido aquí...';
          }
          return '';
        },
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
      }),
      Color.configure({
        types: ['textStyle'],
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] selection:bg-primary selection:text-primary-foreground',
        spellcheck: 'false',
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || [])
        const { state } = view

        items.forEach((item) => {
          if (item.type.indexOf('image') === 0) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file) {
              // Usamos el ImageUploadButton para manejar la subida
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              const dt = new DataTransfer()
              dt.items.add(file)
              input.files = dt.files
              
              const changeEvent = new Event('change')
              input.dispatchEvent(changeEvent)
            }
          }
        })
        return false
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            const dt = new DataTransfer()
            dt.items.add(file)
            input.files = dt.files
            
            const changeEvent = new Event('change')
            input.dispatchEvent(changeEvent)
            return true
          }
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false, {
        preserveWhitespace: 'full',
      })
    }
  }, [content, editor])

  if (!editor) {
    return <div className="border rounded-lg p-4">Cargando editor...</div>
  }

  return (
    <div className="space-y-2">
      <EditorContext.Provider value={{ editor }}>
        <EditorMenuBar 
          editor={editor}
          imageCollection={imageCollection}
          modelType={modelType}
          modelId={modelId}
        />
        
        <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none border rounded-lg p-4 min-h-[300px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
          {editor && (
            <BubbleMenu editor={editor}>
              <EditorBubbleMenu editor={editor} />
            </BubbleMenu>
          )}
          <EditorContent editor={editor} role="presentation" />
        </div>
      </EditorContext.Provider>
    </div>
  )
}