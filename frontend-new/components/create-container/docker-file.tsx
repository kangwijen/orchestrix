'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  RefreshCw,
  FileText as FileTextIcon,
  File as FileIcon,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { containerApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const fileSchema = z
  .object({
    containerName: z
      .string()
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]+$|^$/, 'Invalid container name format')
      .optional(),
    file: z
      .instanceof(File)
      .refine(
        file => file.size <= MAX_FILE_SIZE,
        `File size should be less than 5MB`,
      )
      .optional(),
  })
  .refine(data => data.file, {
    message: 'A file must be uploaded',
    path: ['file'],
  });

type FormValues = z.infer<typeof fileSchema>;

export default function DockerFile() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileType, setFileType] = useState<'Dockerfile' | 'zip' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      containerName: '',
      file: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!data.file || !fileType) {
      toast.error('Please select a file');
      return;
    }

    try {
      setIsSubmitting(true);
      setShowProgress(true);
      setUploadProgress(0);

      if (fileType === 'Dockerfile') {
        await containerApi.buildFromDockerfile(
          data.file,
          data.containerName || undefined,
          progress => setUploadProgress(progress),
        );
      } else if (fileType === 'zip') {
        await containerApi.buildFromZip(
          data.file,
          data.containerName || undefined,
          progress => setUploadProgress(progress),
        );
      }

      toast.success('Container built and created successfully');
      router.push('/dashboard/containers/manage');
    } catch (error: any) {
      console.error('Error creating container:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create container',
      );
    } finally {
      setIsSubmitting(false);
      setShowProgress(false);
    }
  };

  const onDropDockerfile = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setFileType('Dockerfile');
        form.setValue('file', acceptedFiles[0]);
        form.trigger('file');
      }
    },
    [form],
  );

  const onDropZip = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setFileType('zip');
        form.setValue('file', acceptedFiles[0]);
        form.trigger('file');
      }
    },
    [form],
  );

  const {
    getRootProps: getDockerfileRootProps,
    getInputProps: getDockerfileInputProps,
    isDragActive: isDockerfileDragActive,
  } = useDropzone({
    onDrop: onDropDockerfile,
    accept: {},
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    validator: file => {
      if (file.name === 'Dockerfile') {
        return null;
      }
      return {
        code: 'file-invalid-type',
        message: "File must be named 'Dockerfile'",
      };
    },
  });

  const {
    getRootProps: getZipRootProps,
    getInputProps: getZipInputProps,
    isDragActive: isZipDragActive,
  } = useDropzone({
    onDrop: onDropZip,
    accept: { 'application/zip': ['.zip'] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  const clearFile = () => {
    setFileType(null);
    form.setValue('file', undefined);
    form.trigger('file');
  };

  const selectedFile = form.watch('file');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="containerName"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Container Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="my-container" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="space-y-4">
          <Label>Upload Dockerfile or Source Code</Label>

          <div className="flex flex-col gap-6">
            {selectedFile ? (
              <div className="space-y-4">
                <div className="bg-muted flex items-center rounded-md p-4">
                  <div className="flex flex-1 items-center">
                    {fileType === 'Dockerfile' ? (
                      <FileTextIcon className="mr-2 h-6 w-6" />
                    ) : (
                      <FileIcon className="mr-2 h-6 w-6" />
                    )}
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-muted-foreground ml-2 text-sm">
                      ({Math.round(selectedFile.size / 1024)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                  {...getDockerfileRootProps()}
                  className={cn(
                    'hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                    isDockerfileDragActive && 'border-primary bg-primary/10',
                  )}
                >
                  <input {...getDockerfileInputProps()} />
                  <FileTextIcon className="mb-2 h-8 w-8" />
                  <p className="font-medium">Upload Dockerfile</p>
                  <p className="text-muted-foreground text-center text-sm">
                    {isDockerfileDragActive
                      ? 'Drop the file here'
                      : 'Drag and drop a Dockerfile or click to browse'}
                  </p>
                </div>

                <div
                  {...getZipRootProps()}
                  className={cn(
                    'hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                    isZipDragActive && 'border-primary bg-primary/10',
                  )}
                >
                  <input {...getZipInputProps()} />
                  <Upload className="mb-2 h-8 w-8" />
                  <p className="font-medium">Upload ZIP Archive</p>
                  <p className="text-muted-foreground text-center text-sm">
                    {isZipDragActive
                      ? 'Drop the ZIP file here'
                      : 'Drag and drop a ZIP file or click to browse'}
                  </p>
                </div>
              </div>
            )}
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormMessage>{form.formState.errors.file?.message}</FormMessage>
              )}
            />
          </div>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting || !selectedFile}>
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Building...
              </>
            ) : (
              'Build & Create Container'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
