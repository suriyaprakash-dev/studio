
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
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth functions

// Define the validation schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }), // Basic check, adjust as needed
});

type LoginFormInput = z.infer<typeof formSchema>;

export default function LoginPage() {
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
          // No need to toast here, message near button is better UX
    }
  }, []);


  const form = useForm<LoginFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
     mode: 'onChange',
  });

  // onSubmit handler
  const onSubmit: SubmitHandler<LoginFormInput> = async (data) => {
     // Explicitly check if auth is ready and available before proceeding
     if (!firebaseReady || !auth) {
        toast({
            title: "Login Unavailable",
            description: "Firebase is not configured correctly. Please check the setup.",
            variant: "destructive",
        });
        setIsSubmitting(false); // Ensure button is re-enabled
        return; // Stop submission
    }
    setIsSubmitting(true);
    try {
        // Use Firebase to sign in the user
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        console.log("Firebase Login successful:", user);

        // Show success message
        toast({
            title: "Login Successful",
            description: "Welcome back!",
            variant: "default",
        });

        // Redirect to dashboard/home page
        router.push('/'); // Redirect to the main page

    } catch (error: any) { // Catch as 'any' or 'unknown' then check properties
        console.error("Firebase Login Error:", error);
        let errorMessage = "An unexpected error occurred during login.";

        // Check if the error has a 'code' property, typical for Firebase errors
        if (error && typeof error === 'object' && 'code' in error) {
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-credential': // Covers wrong password and email not found in newer SDK versions
                    errorMessage = 'Invalid email or password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'The email address is not valid.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.';
                    break;
                 case 'auth/api-key-not-valid': // Handle specific API key error explicitly
                    errorMessage = 'Invalid Firebase configuration (API Key). Please contact support or check setup.';
                    break;
                default:
                    // Use the error message if available, otherwise keep the generic one
                    errorMessage = error.message ? `Login failed: ${error.message}` : errorMessage;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        toast({
            title: "Login Failed",
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
              <Button type="submit" disabled={isSubmitting || !firebaseReady} className="w-full text-lg py-3 rounded-lg transition-transform transform hover:scale-105 mt-4">
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
               {/* Show message if Firebase isn't ready */}
               {!firebaseReady && (
                    <p className="text-xs text-destructive text-center mt-2">Firebase is not configured correctly. Login is disabled.</p>
               )}
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
