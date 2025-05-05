'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LogIn, UserPlus } from 'lucide-react';

// Define the validation schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }), // Basic check, adjust as needed
});

type LoginFormInput = z.infer<typeof formSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LoginFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
     mode: 'onChange', // Validate on change
  });

  // onSubmit handler
  const onSubmit: SubmitHandler<LoginFormInput> = async (data) => {
    setIsSubmitting(true);
    console.log("Login data:", data); // Log login data

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you'd call your backend API here to authenticate the user
    // For now, just show a success message and simulate success
    toast({
      title: "Login Successful",
      description: "Welcome back!",
      variant: "default",
    });

    // Set authentication flag in localStorage
    try {
        localStorage.setItem('isAuthenticated', 'true');
    } catch (error) {
        console.error("Failed to set auth status in localStorage", error);
        // Handle potential storage errors (e.g., private browsing)
        toast({
            title: "Login State Error",
            description: "Could not save login state. You might be logged out if you close the tab.",
            variant: "destructive",
        });
    }


    // Redirect to dashboard/home page
    router.push('/'); // Redirect to the main page

    // No need to reset form as we are navigating away
    // form.reset();
    // No need to setIsSubmitting(false) due to navigation
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary/30">
      <Card className="w-full max-w-md shadow-xl rounded-xl border-border/60">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
            <LogIn size={28} /> Log In
          </CardTitle>
          <CardDescription>Access your PriceLens account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
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
                     <div className="flex justify-end pt-1">
                       {/* Keep forgot password link, though it's non-functional */}
                       <Link href="#" className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-2">
                         Forgot password?
                       </Link>
                     </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-3 rounded-lg transition-transform transform hover:scale-105 mt-4">
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2" size={20} />
                    Logging In...
                  </>
                ) : (
                  <>
                    <LogIn size={20} className="mr-2"/>
                    Log In
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="flex justify-center items-center pt-4 pb-6">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline underline-offset-4">
                Sign Up
              </Link>
            </p>
          </CardFooter>
      </Card>
        <footer className="mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PriceLens. Powered by Next.js & ShadCN UI.</p>
        </footer>
    </main>
  );
}
