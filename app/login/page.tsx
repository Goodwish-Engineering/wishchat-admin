"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from '@/lib/AuthProvider';
import LoadingSpinner from '@/components/loading-spinner';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ModeToggle } from '@/components/mode-toggle';

const formSchema = z.object({
  login: z.string().min(2, {
    message: "Username or email must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await login(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-3xl font-bold text-center">WishChat</h1>
            </div>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="login"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username or Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username or email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner size={20} /> : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WishChat Admin Portal
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}