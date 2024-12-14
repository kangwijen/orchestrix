"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

const DockerCreatePage = () => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        image: "",
        ports: "",
        environment: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const getHeaders = () => {
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("accessToken="))
            ?.split("=")[1];

        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    const handleCreate = async () => {
        try {
            const portsMap = formData.ports
                ? Object.fromEntries(
                      formData.ports.split(",").map((p) => {
                          const [host, container] = p.split(":");
                          return [container, host];
                      }),
                  )
                : {};

            const envMap = formData.environment
                ? Object.fromEntries(
                      formData.environment.split(",").map((e) => e.split("=")),
                  )
                : {};

            const response = await fetch(
                "http://localhost:5000/api/containers/create",
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        name: formData.name,
                        image: formData.image || "alpine:latest",
                        ports: portsMap,
                        environment: envMap,
                    }),
                },
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            toast({
                title: "Success",
                description: "Container created successfully",
                className: "bg-green-900 text-white border-none",
            });
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message || "Failed to create container",
                className: "bg-red-900 text-white border-none",
            });
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-row items-center text-center space-x-4 mb-4 justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    Create a Docker Container
                </h1>
            </div>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Container Name
                        </label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g.: mysql-db, nginx-server"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Image</label>
                        <Input
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            placeholder="e.g.: alpine:latest, nginx:latest"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Ports (host:container, comma-separated)
                        </label>
                        <Input
                            name="ports"
                            value={formData.ports}
                            onChange={handleInputChange}
                            placeholder="e.g.: 3306:3306, 80:80"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Environment Variables (KEY=value, comma-separated)
                        </label>
                        <Input
                            name="environment"
                            value={formData.environment}
                            onChange={handleInputChange}
                            placeholder="e.g.: MYSQL_ROOT_PASSWORD=pass, MYSQL_DATABASE=app"
                        />
                    </div>
                    <Button onClick={handleCreate} className="w-full">
                        Create Container
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default DockerCreatePage;
