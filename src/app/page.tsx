
// @ts-nocheck - Keep temporarily if needed, but aim to remove
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ElasticityForm } from '@/components/ElasticityForm';
import { ElasticityResult } from '@/components/ElasticityResult';
import type { ElasticityResultData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Target, LogIn, UserPlus, LogOut, LoaderCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Firebase imports removed
import { useToast } from '@/hooks/use-toast'; // Keep toast

// Simulate a user object (replace with your actual user data structure if needed)
interface SimulatedUser {
    uid: string;
    email: string;
}

export default function Home() {
  const [result, setResult] = React.useState<ElasticityResultData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [user, setUser] = React.useState<SimulatedUser | null>(null); // Store simulated user object
  const [authLoading, setAuthLoading] = React.useState(true); // Keep loading state for initial check
  const router = useRouter();
  const { toast } = useToast(); // Get toast function

  // Check simulated authentication status on mount
  React.useEffect(() => {
    setAuthLoading(true); // Start loading
    try {
        const storedUser = localStorage.getItem('simulatedUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    } catch (error) {
        console.error("Error reading simulated user from localStorage:", error);
        setUser(null); // Assume not logged in if error
    } finally {
        setAuthLoading(false); // Stop loading
    }

    // Optional: Listen for storage changes if needed (e.g., logout in another tab)
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'simulatedUser') {
             try {
                const updatedUser = event.newValue ? JSON.parse(event.newValue) : null;
                setUser(updatedUser);
                 if (!updatedUser) {
                    setResult(null); // Clear results on logout
                 }
            } catch (error) {
                console.error("Error parsing updated user from storage event:", error);
                setUser(null);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on unmount
    return () => window.removeEventListener('storage', handleStorageChange);

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
     console.log("Simulating logout...");
     try {
        localStorage.removeItem('simulatedUser'); // Remove simulated user state
        setUser(null); // Update state immediately
        setResult(null); // Clear results
        toast({
            title: "Logged Out (Simulated)",
            description: "You have been successfully logged out.",
            variant: "default",
        });
        // No need to redirect, page content will update based on user state
     } catch (error) {
         console.error("Error removing simulated user from localStorage:", error);
         toast({
            title: "Logout Failed",
            description: "Could not clear login state.",
            variant: "destructive",
         });
     }
  };

  // Show loading indicator while checking auth status
  if (authLoading) {
      return (
          <main className="flex min-h-screen flex-col items-center justify-center p-6">
              <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
              <p className="mt-4 text-muted-foreground">Checking login status...</p>
          </main>
      );
  }

  // Determine authentication status
  const isAuthenticated = !!user;

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-16">
        {/* Header Section */}
        <header className="w-full max-w-5xl mb-10 relative">
            {/* Login/Signup/Logout Links */}
            <div className="absolute top-0 right-0 flex gap-2">
                {isAuthenticated ? (
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
                )}
            </div>

           {/* Main Title and Description */}
            <div className="text-center mt-12 md:mt-0"> {/* Added margin-top for spacing */}
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3 flex items-center justify-center gap-3">
                <Target size={36} className="text-primary"/> PriceLens
              </h1>
              <p className="text-xl text-muted-foreground">
                 {isAuthenticated ? `Welcome, ${user?.email || 'User'}!` : 'Welcome to PriceLens!'}
              </p>
               <Separator className="my-6 max-w-md mx-auto" />
               <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {isAuthenticated
                    ? 'Input your initial and final price and quantity data points below to compute the Price Elasticity of Demand (PED) using the midpoint formula, helping you make informed pricing decisions.'
                    : 'Log in or sign up to gain insights into how price adjustments impact consumer demand and make informed pricing decisions.'
                   }
              </p>
            </div>
        </header>

        {/* Main Content Grid - Conditionally Rendered based on authentication */}
        {isAuthenticated ? ( // Show calculator if authenticated
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
        ) : ( // Show login/signup prompt if not authenticated
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
