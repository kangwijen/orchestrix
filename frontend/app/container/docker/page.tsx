"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Container {
    id: string;
    name: string;
    status: string;
    image: string;
}

const DockerManagementPage = () => {
    const router = useRouter();
    const [containers, setContainers] = useState<Container[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { toast } = useToast();

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

    const fetchContainers = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                "http://localhost:5000/api/containers/list",
                {
                    headers: getHeaders(),
                },
            );
            const data = await response.json();
            setContainers(data);
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch containers",
                className: "bg-red-900 text-white border-none",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async (containerId: string) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/containers/start/${containerId}`,
                {
                    method: "POST",
                    headers: getHeaders(),
                },
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            toast({
                title: "Success",
                description: "Container started successfully",
                className: "bg-green-900 text-white border-none",
            });
            fetchContainers();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to start container: ${error.message}`,
                className: "bg-red-900 text-white border-none",
            });
        }
    };

    const handleStop = async (containerId: string) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/containers/stop/${containerId}`,
                {
                    method: "POST",
                    headers: getHeaders(),
                },
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            toast({
                title: "Success",
                description: "Container stopped successfully",
                className: "bg-green-900 text-white border-none",
            });
            fetchContainers();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to stop container: ${error.message}`,
                className: "bg-red-900 text-white border-none",
            });
        }
    };

    const handleRestart = async (containerId: string) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/containers/restart/${containerId}`,
                {
                    method: "POST",
                    headers: getHeaders(),
                },
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            toast({
                title: "Success",
                description: "Container restarted successfully",
                className: "bg-green-900 text-white border-none",
            });
            fetchContainers();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to restart container: ${error.message}`,
                className: "bg-red-900 text-white border-none",
            });
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
            return;
        }
        fetchContainers();
    }, [router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Card>
                    <CardContent className="flex items-center gap-2 p-6">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Loading...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">
                Docker Management
            </h1>
            <Card>
                <CardContent className="p-4">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {containers?.length > 0 ? (
                                    containers.map((container) => (
                                        <TableRow key={container.id}>
                                            <TableCell>
                                                {container.name}
                                            </TableCell>
                                            <TableCell>
                                                {container.image}
                                            </TableCell>
                                            <TableCell>
                                                {container.status ===
                                                "running" ? (
                                                    <span className="text-green-600">
                                                        Running
                                                    </span>
                                                ) : (
                                                    <span className="text-red-600">
                                                        Stopped
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {container.status ===
                                                "running" ? (
                                                    <div className="flex flex-col justify-center space-y-2 items-center md:flex-row md:space-x-2 md:space-y-0">
                                                        <Button
                                                            variant="destructive"
                                                            className="bg-red-600 hover:bg-red-700 text-white"
                                                            onClick={() =>
                                                                handleStop(
                                                                    container.id,
                                                                )
                                                            }
                                                        >
                                                            Stop
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                            onClick={() =>
                                                                handleRestart(
                                                                    container.id,
                                                                )
                                                            }
                                                        >
                                                            Restart
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col justify-center space-y-2 items-center md:flex-row md:space-x-2 md:space-y-0">
                                                        <Button
                                                            variant="default"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() =>
                                                                handleStart(
                                                                    container.id,
                                                                )
                                                            }
                                                        >
                                                            Start
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center py-4"
                                        >
                                            No containers found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DockerManagementPage;
