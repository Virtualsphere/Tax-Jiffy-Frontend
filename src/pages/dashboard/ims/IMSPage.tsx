import { useCallback } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';

export function IMSPage() {
  const handleUpload = useCallback((file: File, year: string, month: string) => {
    // API logic to be provided by user later
    console.log('Uploading IMS file:', file.name, year, month);
  }, []);

  const handleSync = useCallback(() => {
    // API logic to be provided by user later
    console.log('Syncing IMS');
  }, []);

  return (
    <SimpleUploadUI
      title="IMS"
      subtitle="Upload your IMS data"
      onUpload={handleUpload}
      onSync={handleSync}
    />
  );
}
