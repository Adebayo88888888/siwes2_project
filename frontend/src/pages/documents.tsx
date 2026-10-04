import DocumentUpload from '@/components/documents/DocumentUpload';
import MainLayout from '@/components/layout/MainLayout';

export default function Documents() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Material & Document Management</h1>
          <p className="text-muted-foreground mt-1">
            Upload your course materials, PDF notes, or text files. The AI uses these documents to provide contextual study assistance.
          </p>
        </div>
        <DocumentUpload />
      </div>
    </MainLayout>
  );
}