import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '../../../components/ui/Button.jsx'
import { Loading } from '../../../components/ui/Loading.jsx'
import { Upload, X, ImagePlus } from 'lucide-react'

export default function ImageUploader({ onUpload, maxSize = 5 * 1024 * 1024, maxFiles = 10, accept = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] } }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      alert('Algunos archivos no son válidos. Máximo 5MB, formatos: JPG, PNG, WebP')
    }
    setFiles(prev => [...prev, ...acceptedFiles.map(f => Object.assign(f, { preview: URL.createObjectURL(f) }))])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: maxFiles - files.length,
  })

  const removeFile = (index) => {
    setFiles(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    try {
      await onUpload(files)
      files.forEach(f => URL.revokeObjectURL(f.preview))
      setFiles([])
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input {...getInputProps()} />
        <ImagePlus size={32} className="mx-auto text-slate-400 mb-2" />
        <p className="text-sm text-slate-600">
          {isDragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
        </p>
        <p className="text-xs text-slate-400 mt-1">Máximo {maxFiles} archivos, 5MB cada uno</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {files.map((file, i) => (
              <div key={i} className="relative group">
                <img src={file.preview} alt="preview" className="w-full h-20 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? <Loading size="sm" /> : <Upload size={16} className="mr-2" />}
            {uploading ? 'Subiendo...' : `Subir ${files.length} foto${files.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  )
}
