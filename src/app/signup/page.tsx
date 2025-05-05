
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LogIn, UserPlus, AlertTriangle } from 'lucide-react';
// Firebase imports removed

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

// Simulate a user object (replace with your actual user data structure if needed)
interface SimulatedUser {
    uid: string;
    email: string;
}


export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // Removed firebaseReady state

  // Removed useEffect for checking Firebase readiness

  const form = useForm<SignUpFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // onSubmit handler - Simulate signup
  const onSubmit: SubmitHandler<SignUpFormInput> = async (data) => {
    setIsSubmitting(true);
    console.log("Simulating signup with:", data);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate signup success (always succeeds for this example)
     const simulatedUser: SimulatedUser = { uid: `simulated-${Date.now()}`, email: data.email };
     console.log("Simulated Signup successful:", simulatedUser);

     // Simulate storing user (Optional: you might not need to store on signup if login is required after)
     // localStorage.setItem('simulatedUser', JSON.stringify(simulatedUser)); // Or just redirect

    // Show success message
    toast({
        title: "Signup Successful (Simulated)",
        description: "Welcome! Account created.",
        variant: "default",
    });

    // Redirect to main page after successful signup
    router.push('/'); // Redirect to the main page

    // No need to set isSubmitting to false here as we are redirecting
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary/30">
      <Card className="w-full max-w-md shadow-xl rounded-xl border-border/60">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
             <UserPlus size={28} /> Sign Up
          </CardTitle>
          <CardDescription>Create a new PriceLens account.</CardDescription>
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
                      {/* Ensure value is controlled, defaulting to '' */}
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
                       {/* Ensure value is controlled, defaulting to '' */}
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
                       {/* Ensure value is controlled, defaulting to '' */}
                      <Input type="password" placeholder="••••••••" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Removed disabled={!firebaseReady} */}
              <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-3 rounded-lg transition-transform transform hover:scale-105 mt-4">
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2" size={20} />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} className="mr-2" />
                    Sign Up
                  </>
                )}
              </Button>
               {/* Removed Firebase readiness message */}
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
