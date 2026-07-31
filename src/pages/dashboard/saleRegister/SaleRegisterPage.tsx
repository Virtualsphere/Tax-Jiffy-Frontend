import { useCallback } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';

export function SaleRegisterPage() {
  const handleUpload = useCallback((file: File, year: string, month: string) => {
    // API logic to be provided by user later
    console.log('Uploading Sale Register file:', file.name, year, month);
  }, []);

  const handleSync = useCallback(() => {
    // API logic to be provided by user later
    console.log('Syncing Sale Register');
  }, []);

  return (
    <SimpleUploadUI
      title="Sale Register"
      subtitle="Upload your Sale Register data"
      onUpload={handleUpload}
      onSync={handleSync}
    />
  );
}
