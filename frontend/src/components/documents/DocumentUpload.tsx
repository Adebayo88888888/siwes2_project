import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Upload, File, X, CheckCircle } from 'lucide-react';

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [serverDocs, setServerDocs] = useState<any[]>([]);
  const { toast } = useToast();
  const { token } = useAuth();

  // Load existing documents from backend
  useEffect(() => {
    if (!token) return;
    fetch(`${BACKEND_URL}/api/documents/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      if (Array.isArray(data)) setServerDocs(data);
    })
    .catch(err => console.error('Error fetching documents:', err));
  }, [token]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    for (const fileData of newFiles) {
      try {
        const formData = new FormData();
        formData.append('file', fileData.file);

        const response = await fetch(`${BACKEND_URL}/api/documents/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const uploadedDoc = await response.json();

        setUploadedFiles(prev =>
          prev.map(f =>
            f.file === fileData.file
              ? { ...f, progress: 100, status: 'completed' as const }
              : f
          )
        );

        setServerDocs(prev => [uploadedDoc, ...prev]);

        toast({
          title: 'Success',
          description: `${fileData.file.name} uploaded and indexed successfully.`
        });
      } catch (error) {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.file === fileData.file
              ? { ...f, status: 'error' as const }
              : f
          )
        );

        toast({
          title: 'Error',
          description: `Failed to upload ${fileData.file.name}.`,
          variant: 'destructive'
        });
      }
    }
  }, [token, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(file => file.file !== fileToRemove));
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-primary bg-primary/10 scale-[0.99]' : 'border-muted-foreground/25 hover:border-primary/50 bg-card'}`}
      >
        <input {...getInputProps()} />
        <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <p className="text-base font-semibold">
          {isDragActive
            ? 'Drop your study materials here...'
            : 'Drag and drop files here, or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Supported formats: PDF, TXT, DOC, DOCX (Max size: 10MB)
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Recent Uploads</h3>
          <div className="space-y-2">
            {uploadedFiles.map((fileData, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{fileData.file.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {fileData.status === 'uploading' && (
                    <span className="text-xs text-muted-foreground animate-pulse">Processing...</span>
                  )}
                  {fileData.status === 'completed' && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Ready
                    </span>
                  )}
                  {fileData.status === 'error' && (
                    <span className="text-xs text-red-500 font-medium">Failed</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(fileData.file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {serverDocs.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="text-sm font-semibold">Indexed Documents ({serverDocs.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {serverDocs.map((doc: any, i: number) => (
              <div key={i} className="p-4 rounded-lg border bg-card text-card-foreground flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3 truncate">
                  <File className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{doc.title || 'Untitled Document'}</p>
                    <p className="text-[11px] text-muted-foreground">{doc.source_type || 'file'}</p>
                  </div>
                </div>
                <span className="text-[11px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}