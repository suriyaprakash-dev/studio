
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LogIn } from 'lucide-react';

// Define the validation schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormInput = z.infer<typeof formSchema>;

// Interface for the currently logged-in user (stored in localStorage)
interface CurrentSimulatedUser {
    email: string;
}

// Interface for stored registered user data
interface StoredUser {
    email: string;
    passwordHash: string; // In a real app, this would be a securely hashed password
}


export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LoginFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
     mode: 'onChange',
  });

  const onSubmit: SubmitHandler<LoginFormInput> = async (data) => {
    setIsSubmitting(true);
    console.log("Attempting login with:", data.email);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const registeredUsersString = localStorage.getItem('registeredUsers');
        const registeredUsers: StoredUser[] = registeredUsersString ? JSON.parse(registeredUsersString) : [];

        const foundUser = registeredUsers.find(user => user.email === data.email);

        // IMPORTANT: Password comparison is direct for simulation.
        // In a real app, compare hashed passwords.
        if (foundUser && foundUser.passwordHash === data.password) {
            const currentUser: CurrentSimulatedUser = { email: foundUser.email };
            localStorage.setItem('simulatedUser', JSON.stringify(currentUser));
            console.log("Simulated Login successful for:", currentUser.email);
            toast({
                title: "Login Successful (Simulated)",
                description: `Welcome back, ${currentUser.email}!`,
                variant: "default",
            });
            router.push('/'); // Redirect to the main page
        } else {
            console.log("Simulated Login failed: Invalid credentials");
            toast({
                title: "Login Failed (Simulated)",
                description: "Invalid email or password.",
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    } catch (e) {
        console.error("Error during login simulation:", e);
        toast({
            title: "Login Error (Simulated)",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
        });
        setIsSubmitting(false);
    }
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
                      <Input type="email" placeholder="you@example.com" {...field} value={field.value ?? ''} />
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
                      <Input type="password" placeholder="••••••••" {...field} value={field.value ?? ''} />
                    </FormControl>
                     <FormMessage />
                     <div className="flex justify-end pt-1">
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
