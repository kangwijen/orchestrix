"use client"

import { FileCode as FileCodeIcon } from "lucide-react"

export default function DockerCompose() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <FileCodeIcon className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">Docker Compose Coming Soon</h3>
      <p className="text-muted-foreground text-center max-w-md">
        Support for Docker Compose will be available in a future update. This will allow you to deploy multi-container
        applications using docker-compose.yml files.
      </p>
    </div>
  )
}
