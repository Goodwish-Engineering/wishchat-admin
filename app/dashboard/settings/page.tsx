"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from '@/lib/AuthProvider';
import { updateProfile } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/loading-spinner';
import { 
  User,
  Key,
  Bell,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import logger from '@/lib/logger';

// Form validation schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  first_name: z.string().min(1, {
    message: "First name is required.",
  }),
  last_name: z.string().min(1, {
    message: "Last name is required.",
  }),
  phone_number: z.string().optional(),
});

const passwordFormSchema = z.object({
  current_password: z.string().min(1, {
    message: "Current password is required.",
  }),
  new_password: z.string().min(6, {
    message: "New password must be at least 6 characters.",
  }),
  confirm_password: z.string().min(1, {
    message: "Please confirm your new password.",
  }),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile form setup
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone_number: user?.phone_number || "",
    },
  });

  // Password form setup
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  // Handle profile form submission
  async function onProfileSubmit(values: ProfileFormValues) {
    setIsUpdating(true);
    try {
      await updateProfile({
        username: values.username,
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      // Log the activity
      logger.log(
        user?.username || 'Unknown',
        'setting_changed',
        `Updated profile information`,
        { username: values.username }
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  // Handle password form submission
  async function onPasswordSubmit(values: PasswordFormValues) {
    setIsUpdating(true);
    try {
      await updateProfile({
        username: user?.username || "",
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        password: values.new_password,
      });
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
      // Log the activity
      logger.log(
        user?.username || 'Unknown',
        'setting_changed',
        `Updated password`,
      );
      
      // Reset form
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Optional: Add your phone number for account recovery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isUpdating} className="mt-2">
                    {isUpdating ? <LoadingSpinner size={16} className="mr-2" /> : null}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="current_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 6 characters long
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isUpdating} className="mt-2">
                    {isUpdating ? <LoadingSpinner size={16} className="mr-2" /> : null}
                    Update Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                    <FormLabel>Theme</FormLabel>
                  </div>
                  <FormDescription>
                    Choose between light and dark mode
                  </FormDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="w-16"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="w-16"
                  >
                    Dark
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Compact Mode</FormLabel>
                  <FormDescription>
                    Show more content with less spacing
                  </FormDescription>
                </div>
                <Switch />
              </div>
              
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Animations</FormLabel>
                  <FormDescription>
                    Enable animations and transitions
                  </FormDescription>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Email Notifications</FormLabel>
                  <FormDescription>
                    Receive important updates via email
                  </FormDescription>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>System Notifications</FormLabel>
                  <FormDescription>
                    Show in-app notifications for activities
                  </FormDescription>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Marketing Communications</FormLabel>
                  <FormDescription>
                    Receive promotional emails and offers
                  </FormDescription>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}