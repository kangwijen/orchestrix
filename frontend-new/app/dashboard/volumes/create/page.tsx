'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { volumeApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const keyValueSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
});

const volumeSchema = z.object({
  name: z
    .string()
    .max(128)
    .optional()
    .or(z.literal(''))
    .refine(
      value =>
        !value ||
        /^[a-zA-Z0-9][a-zA-Z0-9_.-]+$/.test(value),
      'Volume name must start with an alphanumeric character and may include ._-',
    ),
  driver: z.string().min(1, 'Driver is required'),
  options: z.array(keyValueSchema).default([]),
  labels: z.array(keyValueSchema).default([]),
});

type FormValues = z.infer<typeof volumeSchema>;

const toRecord = (pairs: { key: string; value: string }[]) => {
  return pairs.reduce<Record<string, string>>((acc, pair) => {
    if (pair.key && pair.value) {
      acc[pair.key] = pair.value;
    }
    return acc;
  }, {});
};

export default function CreateVolumePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(volumeSchema),
    defaultValues: {
      name: '',
      driver: 'local',
      options: [],
      labels: [],
    },
  });

  const optionsFieldArray = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const labelsFieldArray = useFieldArray({
    control: form.control,
    name: 'labels',
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      const payload = {
        name: data.name?.trim() ? data.name.trim() : undefined,
        driver: data.driver,
        options: data.options.length ? toRecord(data.options) : undefined,
        labels: data.labels.length ? toRecord(data.labels) : undefined,
      };

      await volumeApi.createVolume(payload);
      toast.success('Volume created successfully');
      router.push('/dashboard/volumes/manage');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create volume');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Create Volume
        </h2>
        <p className="text-muted-foreground">
          Define a new Docker volume with optional driver options and labels.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volume Details</CardTitle>
          <CardDescription>
            Provide optional name, select a driver, and configure advanced options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Leave empty for auto-generated name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional unique name. Leave blank to let Docker assign one.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver</FormLabel>
                      <FormControl>
                        <Input placeholder="local" {...field} />
                      </FormControl>
                      <FormDescription>
                        Docker volume driver. Default is <code>local</code>.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Driver Options</h3>
                    <p className="text-muted-foreground text-sm">
                      Optional key-value pairs to configure the driver.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      optionsFieldArray.append({ key: '', value: '' })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>

                {optionsFieldArray.fields.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No driver options configured.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {optionsFieldArray.fields.map((fieldItem, index) => (
                      <div
                        key={fieldItem.id}
                        className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_1fr_auto]"
                      >
                        <FormField
                          control={form.control}
                          name={`options.${index}.key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key</FormLabel>
                              <FormControl>
                                <Input placeholder="Option key" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`options.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input placeholder="Option value" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => optionsFieldArray.remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Labels</h3>
                    <p className="text-muted-foreground text-sm">
                      Optional metadata for organizing or filtering volumes.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => labelsFieldArray.append({ key: '', value: '' })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Label
                  </Button>
                </div>

                {labelsFieldArray.fields.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No labels configured.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {labelsFieldArray.fields.map((fieldItem, index) => (
                      <div
                        key={fieldItem.id}
                        className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_1fr_auto]"
                      >
                        <FormField
                          control={form.control}
                          name={`labels.${index}.key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key</FormLabel>
                              <FormControl>
                                <Input placeholder="Label key" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`labels.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input placeholder="Label value" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => labelsFieldArray.remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    'Create Volume'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


