"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText as FileTextIcon, FileCode as FileCodeIcon } from "lucide-react"

import DockerPull from "@/components/create-container/docker-pull"
import DockerFile from "@/components/create-container/docker-file"
import DockerCompose from "@/components/create-container/docker-compose"

export default function CreateContainerPage() {
  const [activeTab, setActiveTab] = useState("pull")

  return (
    <div className="flex w-full flex-col gap-3 pb-6 sm:gap-4">
      <div className="bg-background sticky top-0 z-10 flex items-center justify-between py-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Create Container</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Container Creation</CardTitle>
          <CardDescription>Choose a method to create your new container</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pull" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Pull Image</span>
              </TabsTrigger>
              <TabsTrigger value="dockerfile" className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                <span>Build from File</span>
              </TabsTrigger>
              <TabsTrigger value="compose" className="flex items-center gap-2">
                <FileCodeIcon className="h-4 w-4" />
                <span>Docker Compose</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pull" className="space-y-4">
              <DockerPull />
            </TabsContent>
            
            <TabsContent value="dockerfile" className="space-y-4">
              <DockerFile />
            </TabsContent>
            
            <TabsContent value="compose" className="space-y-4">
              <DockerCompose />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
