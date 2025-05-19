
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
import { LogIn, UserPlus, LoaderCircle } from 'lucide-react';

// Define the validation schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // Set error path to confirmPassword field
});

type SignUpFormInput = z.infer<typeof formSchema>;

// Interface for stored user data
interface StoredUser {
    email: string;
    passwordHash: string; // In a real app, this would be a securely hashed password
}

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SignUpFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<SignUpFormInput> = async (data) => {
    setIsSubmitting(true);
    console.log("Simulating signup with:", data.email);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const existingUsersString = localStorage.getItem('registeredUsers');
        const existingUsers: StoredUser[] = existingUsersString ? JSON.parse(existingUsersString) : [];

        // Check if email already exists (optional for this simulation, but good practice)
        if (existingUsers.some(user => user.email === data.email)) {
            toast({
                title: "Sign Up Failed (Simulated)",
                description: "This email address is already registered.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        // For simulation, storing password directly. In real app, HASH THIS.
        const newUser: StoredUser = { email: data.email, passwordHash: data.password };
        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

        console.log("Simulated Signup successful for:", data.email);
        console.log(`Simulated: Confirmation email sent to ${data.email}`); // Simulate email sending log
        toast({
            title: "Sign Up Successful (Simulated)",
            description: `Your account has been created. A confirmation email has been (simulated) sent to ${data.email}. Please log in.`,
            variant: "default",
        });
        router.push('/login');
    } catch (e) {
        console.error("Could not save simulated user to localStorage:", e);
        toast({
            title: "Sign Up Error (Simulated)",
            description: "An error occurred during sign up. Please try again.",
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
             <UserPlus size={28} /> Sign Up
          </CardTitle>
          <CardDescription>Create your PriceLens account.</CardDescription>
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
                      <Input type="password" placeholder="•••••••• (min. 8 characters)" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-3 rounded-lg transition-transform transform hover:scale-105 mt-4">
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2" size={20} />
                    Signing Up...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} className="mr-2" />
                    Sign Up & Proceed to Login
                  </>
                )}
              </Button>
           </form>
          </Form>
        </CardContent>
         <CardFooter className="flex justify-center items-center pt-4 pb-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
                Log In
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

