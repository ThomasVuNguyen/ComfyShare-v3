import { useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../lib/firebase'

export default function PictureEditor({ content, onUpdate }) {
  const [caption, setCaption] = useState(content.caption || '')
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(content.imageUrl || '')

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const storageRef = ref(storage, `pictures/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setImageUrl(url)
      onUpdate({ imageUrl: url, caption })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = () => {
    onUpdate({ caption, imageUrl })
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm"
        />
        {uploading && <p className="mt-2 text-sm">Uploading...</p>}
      </div>

      {imageUrl && (
        <div className="mb-4">
          <img
            src={imageUrl}
            alt={caption}
            className="max-w-full rounded border"
            style={{ borderColor: 'var(--color-subtle-dark)' }}
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-2 font-medium">Caption</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="input"
          placeholder="Image caption..."
        />
      </div>

      <button onClick={handleSave} className="btn-primary">
        Save Picture
      </button>
    </div>
  )
}
