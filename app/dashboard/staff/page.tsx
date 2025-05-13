"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useSWR from 'swr';
import { createStaff } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/AuthProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/loading-spinner';
import { 
  Users, 
  PlusCircle,
  Shield,
  UserCog,
  UserPlus
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import logger from '@/lib/logger';

// Form validation schema
//Remove Mockdata while apis are integrated
const staffFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  first_name: z.string().min(1, {
    message: "First name is required.",
  }),
  last_name: z.string().min(1, {
    message: "Last name is required.",
  }),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

export default function StaffManagementPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch staff list (this would normally come from the API)
  // For demonstration, we're creating a mock staff list
  const MOCK_STAFF = [
    {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "User",
      is_active: true,
      is_staff: true,
      is_superuser: true,
      date_joined: "2025-01-01T00:00:00Z",
      last_login: "2025-04-30T10:15:30Z",
    },
    {
      id: 2,
      username: "staff1",
      email: "staff1@example.com",
      first_name: "Staff",
      last_name: "One",
      is_active: true,
      is_staff: true,
      is_superuser: false,
      date_joined: "2025-02-15T00:00:00Z",
      last_login: "2025-04-29T14:23:05Z",
    },
    {
      id: 3,
      username: "staff2",
      email: "staff2@example.com",
      first_name: "Staff",
      last_name: "Two",
      is_active: true,
      is_staff: true,
      is_superuser: false,
      date_joined: "2025-03-10T00:00:00Z",
      last_login: "2025-04-28T09:45:12Z",
    },
    {
      id: 4,
      username: "ritesh123",
      email: "ritesh@example.com",
      first_name: "Ritesh",
      last_name: "Test",
      is_active: true,
      is_staff: true,
      is_superuser: false,
      date_joined: "2025-04-15T00:00:00Z",
      last_login: "2025-04-30T08:12:45Z",
    },
  ];

  // In a real application, we would fetch this from the API
  const { data: staffData, error, isLoading, mutate } = useSWR(
    'staff-list',
    () => new Promise(resolve => setTimeout(() => resolve({ staff: MOCK_STAFF }), 500)),
    { refreshInterval: 30000 }
  );

  // Form setup
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      first_name: "",
      last_name: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // Check if user is authorized to view this page
  if (!user?.is_superuser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Shield className="text-destructive w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You don't have permission to access the staff management section.
          This area is restricted to administrators only.
        </p>
      </div>
    );
  }

  // Handle form submission
  async function onSubmit(values: StaffFormValues) {
    try {
      await createStaff(values);
      
      toast({
        title: "Success",
        description: "Staff user created successfully",
      });
      
      // Log the activity
      logger.log(
        user?.username || 'Unknown',
        'staff_created',
        `Created new staff user: ${values.username} (${values.email})`,
        { email: values.email, username: values.username }
      );
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      form.reset();
      
      // Refresh staff data
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create staff user",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Error Loading Staff Data</h2>
        <p className="text-muted-foreground">
          There was an error loading the staff data. Please try again later.
        </p>
      </div>
    );
  }

  const staff = staffData?.staff || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff users and permissions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={16} />
              Add Staff User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Staff User</DialogTitle>
              <DialogDescription>
                Add a new staff user to the system.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="staff@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="staffuser" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormDescription>
                        Password must be at least 6 characters long
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner size={16} className="mr-2" /> : null}
                    Create Staff User
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Users</CardTitle>
          <CardDescription>
            Manage staff accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.is_superuser ? (
                        <Badge className="bg-purple-500">Admin</Badge>
                      ) : (
                        <Badge>Staff</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.last_login)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <UserCog size={16} />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}