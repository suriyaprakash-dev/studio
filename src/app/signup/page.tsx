
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
import { LoaderCircle, LogIn, UserPlus } from 'lucide-react';
import { auth } from '@/lib/firebase/client'; // Import Firebase auth instance
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth functions

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

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [firebaseReady, setFirebaseReady] = React.useState(false);

   React.useEffect(() => {
    // Check if auth object is available (Firebase initialized)
    if (auth) {
      setFirebaseReady(true);
    } else {
      // Handle case where Firebase didn't initialize (e.g., missing config)
      console.error("Firebase Auth is not available. Check configuration.");
       // No need to toast here, message shown near button is better UX
    }
  }, []);


  const form = useForm<SignUpFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // onSubmit handler
  const onSubmit: SubmitHandler<SignUpFormInput> = async (data) => {
     // Explicitly check if auth is ready and available before proceeding
     if (!firebaseReady || !auth) {
        toast({
            title: "Signup Unavailable",
            description: "Firebase is not configured correctly. Please check the setup.",
            variant: "destructive",
        });
        setIsSubmitting(false); // Ensure button is re-enabled
        return; // Stop submission
    }
    setIsSubmitting(true);
    try {
      // Use Firebase to create the user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      console.log("Firebase Signup successful:", user);

      // Show success message
      toast({
        title: "Signup Successful",
        description: "Account created. Please log in.",
        variant: "default",
      });

      // Redirect to login page after successful signup
      router.push('/login');

    } catch (error: any) { // Catch as 'any' or 'unknown' then check properties
      console.error("Firebase Signup Error:", error);
      let errorMessage = "An unexpected error occurred during signup.";

      // Check if the error has a 'code' property, typical for Firebase errors
      if (error && typeof error === 'object' && 'code' in error) {
          switch (error.code) {
              case 'auth/email-already-in-use':
                  errorMessage = 'This email address is already in use.';
                  break;
              case 'auth/invalid-email':
                  errorMessage = 'The email address is not valid.';
                  break;
              case 'auth/weak-password':
                  errorMessage = 'The password is too weak.';
                  break;
              case 'auth/api-key-not-valid': // Handle specific API key error explicitly
                  errorMessage = 'Invalid Firebase configuration (API Key). Please contact support or check setup.';
                   break;
              default:
                  // Use the error message if available, otherwise keep the generic one
                  errorMessage = error.message ? `Signup failed: ${error.message}` : errorMessage;
          }
      } else if (error instanceof Error) {
         errorMessage = error.message;
      }

      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
       setIsSubmitting(false); // Keep form active on error
    }
    // No need to set submitting false or reset form if redirecting on success
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting || !firebaseReady} className="w-full text-lg py-3 rounded-lg transition-transform transform hover:scale-105 mt-4">
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
               {/* Show message if Firebase isn't ready */}
               {!firebaseReady && (
                    <p className="text-xs text-destructive text-center mt-2">Firebase is not configured correctly. Signup is disabled.</p>
               )}
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
