'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileCode as FileCodeIcon, Upload, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { containerApi } from '@/lib/api';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

const composeSchema = z.object({
  composeFile: z
    .instanceof(FileList)
    .refine(files => files.length > 0, 'Please select a compose file')
    .refine(
      files => {
        const file = files[0];
        return (
          file.name.endsWith('.yml') ||
          file.name.endsWith('.yaml')
        );
      },
      'File must be a YAML file (.yml or .yaml)',
    )
    .refine(
      files => files[0].size <= 5 * 1024 * 1024,
      'File size must be less than 5MB',
    ),
});

type FormValues = z.infer<typeof composeSchema>;

export default function DockerCompose() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(composeSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setUploadProgress(0);

      const file = data.composeFile[0];

      await containerApi.buildFromCompose(file, progress => {
        setUploadProgress(progress);
      });

      toast.success('Containers created successfully from compose file');
      router.push('/dashboard/containers/manage');
    } catch (error: any) {
      console.error('Error creating containers from compose:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to create containers from compose file',
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        encType="multipart/form-data"
      >
        <FormField
          control={form.control}
          name="composeFile"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Docker Compose File</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".yml,.yaml"
                      onChange={e => {
                        onChange(e.target.files);
                      }}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </div>
                  {form.watch('composeFile')?.[0] && (
                    <div className="bg-muted rounded-md p-3">
                      <p className="text-sm font-medium">
                        Selected file: {form.watch('composeFile')[0].name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Size:{' '}
                        {(form.watch('composeFile')[0].size / 1024).toFixed(2)}{' '}
                        KB
                      </p>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload a docker-compose.yml or docker-compose.yaml file to
                create containers from it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isSubmitting && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        <div className="bg-muted/50 rounded-md border p-4">
          <div className="flex items-start gap-3">
            <FileCodeIcon className="text-muted-foreground h-5 w-5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">About Docker Compose</p>
              <p className="text-muted-foreground text-xs">
                Docker Compose allows you to define and run multi-container
                Docker applications. This feature will execute the compose file
                and create all defined services, networks, and volumes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Create from Compose
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
