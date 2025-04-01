'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { containerApi } from '@/lib/api';

const containerSchema = z.object({
  imageName: z
    .string()
    .min(1, 'Image name is required')
    .regex(
      /^[a-zA-Z0-9_./-]+:[a-zA-Z0-9_./-]+$/,
      'Invalid image name format. Use format: name:tag',
    ),
  containerName: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]+$|^$/, 'Invalid container name format')
    .optional(),
  portMappings: z.array(
    z
      .object({
        hostPort: z.string(),
        containerPort: z.string(),
      })
      .refine(
        data => {
          if (data.hostPort && !data.containerPort) return false;
          if (!data.hostPort && data.containerPort) return false;
          return true;
        },
        {
          message:
            'Both host port and container port must be filled or both must be empty',
          path: ['containerPort'],
        },
      ),
  ),
  envVariables: z.array(
    z
      .object({
        key: z.string(),
        value: z.string(),
      })
      .refine(
        data => {
          if (data.key && !data.value) return false;
          if (!data.key && data.value) return false;
          return true;
        },
        {
          message: 'Both key and value must be filled or both must be empty',
          path: ['value'],
        },
      ),
  ),
});

type FormValues = z.infer<typeof containerSchema>;

export default function DockerPull() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(containerSchema),
    defaultValues: {
      imageName: '',
      containerName: '',
      portMappings: [{ hostPort: '', containerPort: '' }],
      envVariables: [{ key: '', value: '' }],
    },
  });

  const {
    fields: portFields,
    append: appendPort,
    remove: removePort,
  } = useFieldArray({
    control: form.control,
    name: 'portMappings',
  });

  const {
    fields: envFields,
    append: appendEnv,
    remove: removeEnv,
  } = useFieldArray({
    control: form.control,
    name: 'envVariables',
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      const ports: Record<string, string> = {};
      for (const mapping of data.portMappings) {
        if (mapping.containerPort && mapping.hostPort) {
          ports[`${mapping.containerPort}/tcp`] = mapping.hostPort;
        }
      }

      const environment: Record<string, string> = {};
      for (const env of data.envVariables) {
        if (env.key && env.value) {
          environment[env.key] = env.value;
        }
      }

      await containerApi.createContainer({
        name: data.containerName || undefined,
        image: data.imageName,
        ports,
        environment,
      });

      toast.success('Container created successfully');
      router.push('/dashboard/containers/manage');
    } catch (error: any) {
      console.error('Error creating container:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create container',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="imageName"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Image Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="nginx:latest" {...field} />
                </FormControl>
                <p className="text-muted-foreground text-sm">
                  Format: name:tag (e.g., nginx:latest)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Port Mappings</Label>
            <Button
              type="button"
              onClick={() => appendPort({ hostPort: '', containerPort: '' })}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Port
            </Button>
          </div>

          {portFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`portMappings.${index}.hostPort`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host Port</FormLabel>
                      <FormControl>
                        <Input placeholder="8080" {...field} />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`portMappings.${index}.containerPort`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Container Port</FormLabel>
                      <FormControl>
                        <Input placeholder="80" {...field} />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="button"
                onClick={() => removePort(index)}
                variant="ghost"
                size="icon"
                className="mt-5 h-9 w-9 flex-shrink-0"
                disabled={portFields.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Environment Variables</Label>
            <Button
              type="button"
              onClick={() => appendEnv({ key: '', value: '' })}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Variable
            </Button>
          </div>

          {envFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`envVariables.${index}.key`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key</FormLabel>
                      <FormControl>
                        <Input placeholder="MYSQL_ROOT_PASSWORD" {...field} />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`envVariables.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input placeholder="password123" {...field} />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="button"
                onClick={() => removeEnv(index)}
                variant="ghost"
                size="icon"
                className="mt-5 h-9 w-9 flex-shrink-0"
                disabled={envFields.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Container'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
