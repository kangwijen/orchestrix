"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Cookies from "js-cookie";
const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

const Login = () => {
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setError(null);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FLASK_PROTOCOL}://${process.env.NEXT_PUBLIC_FLASK_HOST}:${process.env.NEXT_PUBLIC_FLASK_PORT}/api/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                },
            );

            const data = await response.json();

            if (response.ok) {
                Cookies.set("accessToken", data.access_token, {
                    expires: 7,
                    secure: true,
                    sameSite: "strict",
                });
                window.location.href = "/dashboard";
            } else {
                setError(data.message || "Login failed");
            }
        } catch (error: any) {
            setError(error.message ?? "Login failed");
        }
    };

    return (
        <main className="container mx-auto min-h-screen flex items-center justify-center p-4">
            <Card className="w-[90%] max-w-md mx-auto">
                <CardHeader className="space-y-2 p-4 sm:p-6">
                    <CardTitle className="text-xl sm:text-2xl text-center">
                        Login
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 sm:space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Username
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                variant="outline"
                                className="w-full"
                            >
                                Login
                            </Button>
                        </form>
                    </Form>
                    {error && (
                        <p className="text-red-500 text-center mt-4 sm:mt-6 text-sm">
                            {error}
                        </p>
                    )}
                </CardContent>
            </Card>
        </main>
    );
};

export default Login;
