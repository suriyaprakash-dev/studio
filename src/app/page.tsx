
// @ts-nocheck
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ElasticityForm } from '@/components/ElasticityForm';
import { ElasticityResult } from '@/components/ElasticityResult';
import type { ElasticityResultData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Target, LogIn, UserPlus, LogOut, LoaderCircle, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/client'; // Import Firebase auth
import { onAuthStateChanged, signOut, User } from 'firebase/auth'; // Import Firebase auth functions
import { useToast } from '@/hooks/use-toast'; // Import toast

export default function Home() {
  const [result, setResult] = React.useState<ElasticityResultData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null); // Store Firebase user object
  const [authLoading, setAuthLoading] = React.useState(true); // Add loading state for auth check
  const [firebaseReady, setFirebaseReady] = React.useState(false); // State for Firebase readiness
  const router = useRouter();
  const { toast } = useToast(); // Get toast function

  // Check authentication status and Firebase readiness on mount
  React.useEffect(() => {
    // Check if the auth object exists (primary indicator of successful init)
    if (!auth) {
      console.error("Firebase auth is not initialized. Cannot check auth state. Check Firebase configuration.");
      setFirebaseReady(false);
      setAuthLoading(false); // Stop loading, Firebase is not ready
      // Optionally show a persistent warning if needed, but UI elements handle this now
      // toast({ /* ... */ });
      return; // Exit effect
    }

    // If auth object exists, assume Firebase is ready for auth operations
    setFirebaseReady(true);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set user (or null)
      setAuthLoading(false); // Auth check complete
      if (!currentUser) {
        setResult(null); // Clear results if user logs out / not logged in
      }
    }, (error) => {
        // Handle potential errors during listener setup (less common)
        console.error("Error setting up Firebase auth listener:", error);
        setFirebaseReady(false); // Mark as not ready if listener fails
        setAuthLoading(false);
         toast({
            title: "Authentication Error",
            description: "Could not listen for authentication changes. Please refresh.",
            variant: "destructive",
         });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleCalculationStart = () => {
    setIsLoading(true);
    setResult(null); // Clear previous results
  };

  const handleCalculationEnd = (calculationResult: ElasticityResultData) => {
    setResult(calculationResult);
    setIsLoading(false);
  };

  const handleLogout = async () => {
     if (!firebaseReady || !auth) { // Double-check readiness before logout
         console.error("Firebase auth is not initialized. Cannot log out.");
          toast({
            title: "Logout Failed",
            description: "Firebase is not ready or configured correctly.",
            variant: "destructive",
        });
        return;
    }
    try {
        await signOut(auth); // Sign out using Firebase
        // State updates (user, result) will be handled by the onAuthStateChanged listener
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
            variant: "default",
        });
        // Optional: Redirect or further actions after logout
    } catch (error) {
        console.error("Firebase Logout Error:", error);
         toast({
            title: "Logout Failed",
            description: error instanceof Error ? error.message : "An unexpected error occurred during logout.",
            variant: "destructive",
        });
    }
  };

  // Show loading indicator while checking auth status or Firebase readiness
  if (authLoading) {
      return (
          <main className="flex min-h-screen flex-col items-center justify-center p-6">
              <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
              <p className="mt-4 text-muted-foreground">Initializing...</p>
          </main>
      );
  }

  // Determine authentication status ONLY if Firebase is ready
  const isAuthenticated = firebaseReady && !!user;

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-16">
        {/* Header Section */}
        <header className="w-full max-w-5xl mb-10 relative">
            {/* Login/Signup/Logout Links - Conditionally render based on firebaseReady and user state */}
            <div className="absolute top-0 right-0 flex gap-2">
                {firebaseReady ? (
                    isAuthenticated ? (
                        <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-1.5 text-sm">
                            <LogOut size={16} />
                            Logout
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                            <Link href="/login" className="flex items-center gap-1.5 text-sm">
                                <LogIn size={16} />
                                Login
                            </Link>
                            </Button>
                            <Button variant="outline" asChild>
                            <Link href="/signup" className="flex items-center gap-1.5 text-sm">
                                <UserPlus size={16} />
                                Sign Up
                            </Link>
                            </Button>
                        </>
                    )
                ) : (
                    // Optionally show a disabled state or hide if Firebase isn't ready
                    <span className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle size={14} /> Auth Unavailable
                    </span>
                 )}
            </div>

           {/* Main Title and Description */}
            <div className="text-center mt-12 md:mt-0"> {/* Added margin-top for spacing */}
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3 flex items-center justify-center gap-3">
                <Target size={36} className="text-primary"/> PriceLens
              </h1>
              <p className="text-xl text-muted-foreground">
                {firebaseReady ? (isAuthenticated ? `Welcome, ${user?.email || 'User'}!` : 'Welcome to PriceLens!') : 'Welcome to PriceLens!'}
              </p>
               <Separator className="my-6 max-w-md mx-auto" />
               <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {firebaseReady ? (
                    isAuthenticated
                        ? 'Input your initial and final price and quantity data points below to compute the Price Elasticity of Demand (PED) using the midpoint formula, helping you make informed pricing decisions.'
                        : 'Log in or sign up to gain insights into how price adjustments impact consumer demand and make informed pricing decisions.'
                    ) : (
                    'Authentication is currently unavailable due to a configuration issue. Please ensure Firebase is set up correctly in your environment.'
                    )
                  }
              </p>
            </div>
        </header>

        {/* Main Content Grid - Conditionally Rendered based on firebaseReady and authentication */}
        {firebaseReady ? (
           isAuthenticated ? ( // Show calculator if ready and authenticated
             <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
               <div className="lg:col-span-3">
                 <ElasticityForm
                    onCalculationStart={handleCalculationStart}
                    onCalculationEnd={handleCalculationEnd}
                 />
               </div>
               <div className="lg:col-span-2">
                  <ElasticityResult result={result} isLoading={isLoading} />
               </div>
            </div>
          ) : ( // Show login/signup prompt if ready but not authenticated
              <Card className="w-full max-w-lg mt-8 text-center p-8 bg-secondary/50 rounded-xl shadow-md">
                  <CardHeader>
                      <CardTitle className="text-2xl">Get Started</CardTitle>
                      <CardDescription>Please log in or sign up to use the Price Elasticity Calculator.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center gap-4">
                       <Button asChild size="lg">
                        <Link href="/login" className="flex items-center gap-1.5">
                          <LogIn size={18} />
                          Login
                        </Link>
                      </Button>
                      <Button variant="outline" asChild size="lg">
                        <Link href="/signup" className="flex items-center gap-1.5">
                          <UserPlus size={18} />
                          Sign Up
                        </Link>
                      </Button>
                  </CardContent>
              </Card>
          )
        ) : ( // Show config error message if Firebase not ready
             <Card className="w-full max-w-lg mt-8 text-center p-8 bg-destructive/10 border-destructive rounded-xl shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive flex items-center justify-center gap-2">
                        <AlertTriangle size={24}/> Configuration Error
                    </CardTitle>
                    <CardDescription className="text-destructive-foreground/80">
                        Authentication features are currently disabled.
                        Please ensure Firebase environment variables (like <code className="font-mono text-xs bg-destructive/20 px-1 py-0.5 rounded">NEXT_PUBLIC_FIREBASE_API_KEY</code>) are correctly set up.
                    </CardDescription>
                </CardHeader>
             </Card>
        )}


        {/* Understanding Elasticity Card (Always visible) */}
        <Card className="w-full max-w-5xl mt-12 shadow-lg rounded-xl border-border/60 card-hover-effect">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold">Understanding Elasticity</CardTitle>
                 <CardDescription>Interpret your PED result:</CardDescription>
            </CardHeader>
            <CardContent className="text-base text-muted-foreground space-y-3">
                <p><strong className="font-medium text-foreground">Elastic (PED &gt; 1):</strong> Demand is highly responsive to price changes. A price decrease could significantly boost quantity sold, potentially increasing revenue.</p>
                <p><strong className="font-medium text-foreground">Inelastic (0 &lt; PED &lt; 1):</strong> Demand is relatively unresponsive to price changes. A price increase might lead to higher revenue despite a small drop in quantity sold.</p>
                <p><strong className="font-medium text-foreground">Unit Elastic (PED = 1):</strong> Percentage change in quantity demanded perfectly matches the percentage change in price. Revenue is likely maximized at the current price point.</p>
                <p><strong className="font-medium text-foreground">Perfectly Inelastic (PED = 0):</strong> Quantity demanded remains constant regardless of price changes (rare in practice, often applies to essential goods with no substitutes).</p>
                <p><strong className="font-medium text-foreground">Perfectly Elastic (PED = ∞):</strong> Consumers demand an infinite quantity at a specific price, but none above it (theoretical, seen in perfectly competitive markets).</p>
            </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PriceLens. Powered by Next.js & ShadCN UI.
             {' '} | {' '}
              <Link href="/contact" className="hover:text-primary hover:underline underline-offset-2">
                Contact Us
              </Link>
            </p>
        </footer>
    </main>
  );
}
