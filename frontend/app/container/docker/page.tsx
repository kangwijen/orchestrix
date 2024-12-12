"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { RotateCw } from "lucide-react";

interface Container {
    id: string;
    name: string;
    status: string;
    image: string;
}

const DockerManagementPage = () => {
    const [containers, setContainers] = useState<Container[]>([]);
    const [removePassword, setRemovePassword] = useState("");
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

    const handleRemove = async (containerId: string) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/containers/remove/${containerId}`,
                {
                    method: "DELETE",
                    headers: getHeaders(),
                    body: JSON.stringify({ password: removePassword })
                },
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            toast({
                title: "Success",
                description: "Container removed successfully",
                className: "bg-green-900 text-white border-none",
            });
            setRemovePassword("");
            fetchContainers();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to remove container: ${error.message}`,
                className: "bg-red-900 text-white border-none",
            });
        }
    };

    useEffect(() => {
        fetchContainers();
    }, []);

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-row items-center text-center space-x-4 mb-4 justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    Docker Management 
                </h1>
                <Button onClick={fetchContainers}>
                    <RotateCw className="h-6 w-6 inline-block" />
                    Refresh
                </Button>
            </div>
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
                                                        <AlertDialog>
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
                                                                <Button className="bg-red-600 hover:bg-red-700 text-white">
                                                                    Stop
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Are you absolutely sure?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action will stop the container and all unsaved data will be lost.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="bg-green-600 hover:bg-green-700 text-white">
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                                        onClick={() =>
                                                                            handleStop(
                                                                                container.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Continue
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
                                                                <Button className="bg-blue-600 hover:bg-blue-700">
                                                                    Restart
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Are you absolutely sure?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action will restart the container and all unsaved data will be lost.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="bg-green-600 hover:bg-green-700 text-white">
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                                        onClick={() =>
                                                                            handleRestart(
                                                                                container.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Continue
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
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
                                                        <AlertDialog>
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
                                                                <Button className="bg-red-600 hover:bg-red-700">
                                                                Remove
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Are you absolutely sure?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action will remove the container and all unsaved data will be lost. Enter your password to confirm:
                                                                        <Input 
                                                                            type="password" 
                                                                            placeholder="Password" 
                                                                            className="mt-4" 
                                                                            value={removePassword}
                                                                            onChange={(e) => setRemovePassword(e.target.value)}
                                                                        />
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="bg-green-600 hover:bg-green-700 text-white">
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                                        onClick={() =>
                                                                            handleRemove(
                                                                                container.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Continue
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
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
