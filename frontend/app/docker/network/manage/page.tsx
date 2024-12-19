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

import { Gauge } from "@/components/gauge";

type Network = {
    Id: string;
    Name: string;
    Scope: string;
    Driver: string;
};

const DockerNetworkManagePage = () => {
    const [networks, setNetworks] = useState<Network[]>([]);
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

    const fetchNetworks = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FLASK_PROTOCOL}://${process.env.NEXT_PUBLIC_FLASK_HOST}:${process.env.NEXT_PUBLIC_FLASK_PORT}/api/networks/list`,
                {
                    headers: getHeaders(),
                },
            );
            const data = await response.json();
            setNetworks(data);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch networks",
                className: "bg-red-900 text-white border-none",
            });
        }
    };

    useEffect(() => {
        fetchNetworks();
    }, []);


    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-row items-center text-center space-x-4 mb-4 justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    Manage Docker Networks
                </h1>
                <Button onClick={fetchNetworks}>
                    <RotateCw className="h-6 w-6 inline-block" />
                    Refresh
                </Button>
            </div>
            <Card>

            </Card>
        </div>
    );
};

export default DockerNetworkManagePage;
