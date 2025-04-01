'use client';

import { FileCode as FileCodeIcon } from 'lucide-react';

export default function DockerCompose() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <FileCodeIcon className="text-muted-foreground mb-4 h-16 w-16" />
      <h3 className="mb-2 text-xl font-semibold">Docker Compose Coming Soon</h3>
      <p className="text-muted-foreground max-w-md text-center">
        Support for Docker Compose will be available in a future update. This
        will allow you to deploy multi-container applications using
        docker-compose.yml files.
      </p>
    </div>
  );
}
