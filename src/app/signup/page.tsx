
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Removed react-hook-form and zod imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
// Removed Form components
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react'; // Removed LoaderCircle, AlertTriangle

// Removed form schema and type definition

// Removed simulated user interface

export default function SignUpPage() {
  const { toast } = useToast(); // Keep toast if needed for other interactions, though not used here now
  const router = useRouter();
  // Removed isSubmitting state

  // Removed form instance

  // Simplified handler to just navigate
  const handleSignUpClick = () => {
    console.log("Simulating signup and redirecting...");
    // Optionally show a message before redirecting
    // toast({
    //     title: "Redirecting...",
    //     description: "Taking you to the main page.",
    // });

    // Directly redirect to the main page
    router.push('/');
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary/30">
      <Card className="w-full max-w-md shadow-xl rounded-xl border-border/60">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
             <UserPlus size={28} /> Sign Up
          </CardTitle>
          <CardDescription>Create a new PriceLens account (Dummy).</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Removed Form wrapper */}
          {/* Simplified form structure - inputs are present but not functional */}
          <div className="space-y-5">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" disabled />
                {/* Removed FormMessage */}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="•••••••• (min. 8 characters)" disabled />
                {/* Removed FormMessage */}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" disabled />
                {/* Removed FormMessage */}
              </div>
              {/* Changed Button type to "button" and added onClick handler */}
              <Button type="button" onClick={handleSignUpClick} className="w-full text-lg py-3 rounded-lg transition-transform transform hover:scale-105 mt-4">
                  {/* Simplified button text */}
                  <UserPlus size={20} className="mr-2" />
                  Sign Up & Go to Main Page
              </Button>
           </div>
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
