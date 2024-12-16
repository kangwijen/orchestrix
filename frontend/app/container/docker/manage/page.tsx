"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/collapsible";

import { RotateCw } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface PortBinding {
    HostIp: string;
    HostPort: string;
}

interface Container {
    id: string;
    name: string;
    status: string;
    image: string;
    created: string;
    ports: { [key: string]: PortBinding[] | null };
}

const DockerManagementPage = () => {
    const [containers, setContainers] = useState<Container[]>([]);
    const [removePassword, setRemovePassword] = useState("");
    const [logs, setLogs] = useState("");
    const [logsOpen, setLogsOpen] = useState(false);
    const [selectedContainer, setSelectedContainer] = useState("");
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
                `${process.env.NEXT_PUBLIC_FLASK_PROTOCOL}://${process.env.NEXT_PUBLIC_FLASK_HOST}:${process.env.NEXT_PUBLIC_FLASK_PORT}/api/containers/list`,
                {
                    headers: getHeaders(),
                },
            );
            const data = await response.json();
            setContainers(data);
        } catch (err) {
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
                `${process.env.NEXT_PUBLIC_FLASK_PROTOCOL}://${process.env.NEXT_PUBLIC_FLASK_HOST}:${process.env.NEXT_PUBLIC_FLASK_PORT}/api/containers/start/${containerId}`,
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
                `${process.env.NEXT_PUBLIC_FLASK_PROTOCOL}://${process.env.NEXT_PUBLIC_FLASK_HOST}:${process.env.NEXT_PUBLIC_FLASK_PORT}/api/containers/stop/${containerId}`,
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
                `${process.env.NEXT_PUBLIC_FLASK_PROTOCOL}://${process.env.NEXT_PUBLIC_FLASK_HOST}:${process.env.NEXT_PUBLIC_FLASK_PORT}/api/containers/restart/${containerId}`,
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
                `${process.env.NEXT_PUBLIC_FLASK_PROTOCOL}://${process.env.NEXT_PUBLIC_FLASK_HOST}:${process.env.NEXT_PUBLIC_FLASK_PORT}/api/containers/remove/${containerId}`,
                {
                    method: "DELETE",
                    headers: getHeaders(),
                    body: JSON.stringify({ password: removePassword }),
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

    const handleViewLogs = async (containerId: string) => {
        try {
            setSelectedContainer(containerId);
            setLogsOpen(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FLASK_PROTOCOL}://${process.env.NEXT_PUBLIC_FLASK_HOST}:${process.env.NEXT_PUBLIC_FLASK_PORT}/api/containers/logs/${containerId}`,
                {
                    headers: getHeaders(),
                },
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setLogs(data.logs);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to fetch logs: ${error.message}`,
                className: "bg-red-900 text-white border-none",
            });
            setLogsOpen(false);
        }
    };

    useEffect(() => {
        fetchContainers();
    }, []);

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-row items-center text-center space-x-4 mb-4 justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    Manage Docker Containers
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
                                        <Collapsible key={container.id} asChild>
                                            <>
                                                <TableRow className="cursor-pointer hover:bg-slate-900">
                                                    <TableCell>
                                                        <CollapsibleTrigger
                                                            asChild
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {container.name}
                                                            </div>
                                                        </CollapsibleTrigger>
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
                                                                    <AlertDialogContent className="bg-black">
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>
                                                                                Are
                                                                                you
                                                                                absolutely
                                                                                sure?
                                                                            </AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This
                                                                                action
                                                                                will
                                                                                stop
                                                                                the
                                                                                container
                                                                                and
                                                                                all
                                                                                unsaved
                                                                                data
                                                                                will
                                                                                be
                                                                                lost.
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
                                                                    <AlertDialogContent className="bg-black">
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>
                                                                                Are
                                                                                you
                                                                                absolutely
                                                                                sure?
                                                                            </AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This
                                                                                action
                                                                                will
                                                                                restart
                                                                                the
                                                                                container
                                                                                and
                                                                                all
                                                                                unsaved
                                                                                data
                                                                                will
                                                                                be
                                                                                lost.
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
                                                                    <AlertDialogContent className="bg-black">
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>
                                                                                Are
                                                                                you
                                                                                absolutely
                                                                                sure?
                                                                            </AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This
                                                                                action
                                                                                will
                                                                                remove
                                                                                the
                                                                                container
                                                                                and
                                                                                all
                                                                                unsaved
                                                                                data
                                                                                will
                                                                                be
                                                                                lost.
                                                                                Enter
                                                                                your
                                                                                password
                                                                                to
                                                                                confirm:
                                                                                <Input
                                                                                    type="password"
                                                                                    placeholder="Password"
                                                                                    className="mt-4"
                                                                                    value={
                                                                                        removePassword
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) =>
                                                                                        setRemovePassword(
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
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
                                                <CollapsibleContent asChild>
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={4}
                                                            className="p-4"
                                                        >
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <span className="font-semibold">
                                                                        Created:
                                                                    </span>{" "}
                                                                    {
                                                                        container.created
                                                                    }
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold">
                                                                        Ports:
                                                                    </span>{" "}
                                                                    {container.ports
                                                                        ? Object.entries(
                                                                              container.ports,
                                                                          )
                                                                              .map(
                                                                                  ([
                                                                                      port,
                                                                                      bindings,
                                                                                  ]) =>
                                                                                      bindings
                                                                                          ? `${port} -> ${bindings.map((binding) => `${binding.HostIp}:${binding.HostPort}`).join(", ")}`
                                                                                          : `${port} (exposed)`,
                                                                              )
                                                                              .join(
                                                                                  ", ",
                                                                              )
                                                                        : "None"}
                                                                </div>
                                                                <div>
                                                                    <Button 
                                                                        className="bg-blue-600 hover:bg-blue-700"
                                                                        onClick={() =>
                                                                            handleViewLogs(
                                                                                container.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        View Logs
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                </CollapsibleContent>
                                            </>
                                        </Collapsible>
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

            <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            Container Logs
                        </DialogTitle>
                        <DialogDescription>
                            Viewing logs for container: {selectedContainer}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                        <pre className="font-mono text-sm whitespace-pre-wrap bg-slate-950 p-4 rounded-md">
                            {logs || "No logs available"}
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DockerManagementPage;
