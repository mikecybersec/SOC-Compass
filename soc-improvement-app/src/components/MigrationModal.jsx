import React, { useState, useEffect } from 'react';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import { Input } from '../components/ui/Input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { migrationAPI } from '../api/migration';
import { Upload, Download, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { toastSuccess, toastError } from '../utils/toast';

const MigrationModal = ({ open, onClose, onMigrationComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [localStorageData, setLocalStorageData] = useState(null);

  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      // Check if localStorage has data
      try {
        const data = localStorage.getItem('soc-improvement-app-state');
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.workspaces && parsed.workspaces.length > 0) {
            setLocalStorageData(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to read localStorage:', error);
      }
    }
  }, [open]);

  const handleImportFromLocalStorage = async () => {
    if (!localStorageData) return;

    setIsImporting(true);
    setImportProgress('Importing data...');

    try {
      const result = await migrationAPI.import(localStorageData);
      
      setImportProgress('Migration complete!');
      toastSuccess(`Imported ${result.imported.workspaces} workspaces and ${result.imported.assessments} assessments`);
      
      // Clear localStorage after successful import
      localStorage.removeItem('soc-improvement-app-state');
      
      setTimeout(() => {
        onMigrationComplete?.();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Migration failed:', error);
      toastError('Migration failed: ' + error.message);
      setImportProgress('');
      setIsImporting(false);
    }
  };

  const handleImportFromFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress('Reading file...');

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      setImportProgress('Importing data...');
      const result = await migrationAPI.import(data);
      
      setImportProgress('Migration complete!');
      toastSuccess(`Imported ${result.imported.workspaces} workspaces and ${result.imported.assessments} assessments`);
      
      setTimeout(() => {
        onMigrationComplete?.();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Import failed:', error);
      toastError('Import failed: ' + error.message);
      setImportProgress('');
      setIsImporting(false);
    }
  };

  const handleDownloadBackup = () => {
    if (!localStorageData) return;

    const blob = new Blob([JSON.stringify(localStorageData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soc-compass-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toastSuccess('Backup downloaded');
  };

  if (!open) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <AlertDialogTitle>Migrate Your Data</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left pt-2">
            {localStorageData ? (
              <>
                <p className="mb-3">
                  We detected existing data in your browser. SOC Compass now uses a database for better performance and features like file uploads.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium mb-2">Found in browser storage:</p>
                  <ul className="text-sm space-y-1">
                    <li>• {localStorageData.workspaces?.length || 0} workspace(s)</li>
                    <li>• {localStorageData.workspaces?.reduce((sum, w) => sum + (w.assessments?.length || 0), 0) || 0} assessment(s)</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="mb-3">
                Import your data from a previous export or start fresh with the new database-backed version.
              </p>
            )}
            
            {isImporting && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">{importProgress}</span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isImporting && (
          <div className="space-y-3">
            {localStorageData && (
              <>
                <Button
                  onClick={handleImportFromLocalStorage}
                  className="w-full gap-2"
                  variant="primary"
                >
                  <Upload className="h-4 w-4" />
                  Import from Browser Storage
                </Button>
                
                <Button
                  onClick={handleDownloadBackup}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Download Backup First
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
              </>
            )}
            
            <div>
              <Input
                type="file"
                accept=".json"
                onChange={handleImportFromFile}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Import from a previously exported JSON file
              </p>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isImporting}>
            {localStorageData ? 'Skip for now' : 'Close'}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MigrationModal;

