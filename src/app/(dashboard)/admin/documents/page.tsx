'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react'

type Document = {
  id: string
  file_name: string
  processed: boolean
  created_at: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/documents')
    const data = await res.json()
    setDocuments(data.documents || [])
    setLoading(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/admin/documents', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      await fetchDocuments()
    }

    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Company Documents</h1>
          <p className="text-muted-foreground">
            Upload documents and let AI answer employee questions from them
          </p>
        </div>

        {/* Upload Area */}
        <Card className="p-6 mb-6">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium mb-1">Upload a document</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF and TXT files
            </p>
            <label>
              <input
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <Button disabled={uploading} className="gap-2" asChild>
                <span>
                  {uploading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    : <><Upload className="w-4 h-4" /> Choose File</>
                  }
                </span>
              </Button>
            </label>
          </div>
        </Card>

        {/* Documents List */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Uploaded Documents ({documents.length})</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={doc.processed ? 'default' : 'secondary'}>
                    {doc.processed
                      ? <><CheckCircle className="w-3 h-3 mr-1" />Ready</>
                      : 'Processing...'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No documents uploaded yet.</p>
              <p className="text-sm">Upload your company handbook or SOPs above.</p>
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}