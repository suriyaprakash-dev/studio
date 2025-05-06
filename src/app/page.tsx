

// @ts-nocheck - Keep temporarily if needed, but aim to remove
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ElasticityForm } from '@/components/ElasticityForm';
import { ElasticityResult } from '@/components/ElasticityResult';
import type { ElasticityResultData, ElasticityInput } from '@/app/actions'; // Import ElasticityInput
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Target, LogIn, UserPlus, LogOut, LoaderCircle, AlertTriangle, BookOpen, Settings, Phone } from 'lucide-react'; // Added Settings, Phone icons
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Simulate a user object (replace with your actual user data structure if needed)
interface SimulatedUser {
    uid: string;
    email: string;
}

export default function Home() {
  const [result, setResult] = React.useState<ElasticityResultData | null>(null);
  const [lastInput, setLastInput] = React.useState<ElasticityInput | null>(null); // Store last valid input for chart
  const [isLoading, setIsLoading] = React.useState(false);
  const [user, setUser] = React.useState<SimulatedUser | null>(null); // Store simulated user object
  const [authLoading, setAuthLoading] = React.useState(true); // Keep loading state for initial check
  const router = useRouter();
  const { toast } = useToast();

  // Check simulated authentication status on mount
  React.useEffect(() => {
    setAuthLoading(true);
    try {
        const storedUser = localStorage.getItem('simulatedUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    } catch (error) {
        console.error("Error reading simulated user from localStorage:", error);
        setUser(null);
    } finally {
        setAuthLoading(false);
    }

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'simulatedUser') {
             try {
                const updatedUser = event.newValue ? JSON.parse(event.newValue) : null;
                setUser(updatedUser);
                 if (!updatedUser) {
                    setResult(null);
                    setLastInput(null); // Reset input on logout
                 }
            } catch (error) {
                console.error("Error parsing updated user from storage event:", error);
                setUser(null);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCalculationStart = () => {
    setIsLoading(true);
    setResult(null);
    setLastInput(null); // Clear previous input on new calculation
  };

  // Update to receive both result and input data
  const handleCalculationEnd = (calculationResult: ElasticityResultData, inputData?: ElasticityInput) => {
    setResult(calculationResult);
    // Only store input data if calculation was successful (no error)
    if (!calculationResult.error && inputData) {
        setLastInput(inputData);
    } else {
        setLastInput(null); // Clear input if there was an error
    }
    setIsLoading(false);
  };


  const handleLogout = async () => {
     console.log("Simulating logout...");
     try {
        localStorage.removeItem('simulatedUser');
        setUser(null);
        setResult(null);
        setLastInput(null); // Clear input on logout
        toast({
            title: "Logged Out (Simulated)",
            description: "You have been successfully logged out.",
            variant: "default",
        });
     } catch (error) {
         console.error("Error removing simulated user from localStorage:", error);
         toast({
            title: "Logout Failed",
            description: "Could not clear login state.",
            variant: "destructive",
         });
     }
  };

  if (authLoading) {
      return (
          <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
              <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
              <p className="mt-4 text-muted-foreground">Checking login status...</p>
          </main>
      );
  }

  const isAuthenticated = !!user;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background to-secondary/40"> {/* Applied gradient to the outer div */}
        {/* Header Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"> {/* Added slight shadow */}
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between"> {/* Increased height */}
                {/* Logo/Title */}
                <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-primary transition-transform hover:scale-105"> {/* Increased gap, size, added hover effect */}
                    <Target size={26} />
                    <span>PriceLens</span>
                </Link>

                {/* Auth Buttons */}
                 <div className="flex items-center gap-3"> {/* Increased gap */}
                    {isAuthenticated ? (
                        <>
                            <span className="text-sm text-muted-foreground hidden sm:inline-block mr-2">
                                {user?.email || 'User'}
                            </span>
                             {/* Optional Settings Button (example) */}
                            <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:flex">
                                <Settings size={18} />
                                <span className="sr-only">Settings</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium"> {/* Adjusted size, weight */}
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild className="text-sm font-medium"> {/* Adjusted size, weight */}
                            <Link href="/login" className="flex items-center gap-1.5">
                                <LogIn size={16} />
                                <span className="hidden sm:inline">Login</span>
                            </Link>
                            </Button>
                            <Button variant="default" size="sm" asChild className="text-sm font-medium shadow-sm"> {/* Adjusted size, weight, added default variant + shadow */}
                            <Link href="/signup" className="flex items-center gap-1.5">
                                <UserPlus size={16} />
                                <span className="hidden sm:inline">Sign Up</span>
                            </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>

       {/* Main Content Area */}
        <main className="flex-1 container max-w-6xl mx-auto px-4 py-12 md:py-20 lg:py-24"> {/* Increased padding */}

             {/* Hero Section */}
            <section className="text-center mb-16 md:mb-20 lg:mb-24"> {/* Increased bottom margin */}
                 <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-5 tracking-tight"> {/* Bolder, tighter tracking */}
                    Analyze Price Elasticity
                 </h1>
                 <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8"> {/* Slightly increased bottom margin */}
                      {isAuthenticated
                        ? 'Input your initial and final price and quantity data points below to compute the Price Elasticity of Demand (PED) using the midpoint formula, helping you make informed pricing decisions.'
                        : 'Gain insights into how price adjustments impact consumer demand. Log in or sign up to use the calculator.'
                       }
                  </p>
                  <Separator className="max-w-md mx-auto bg-border/60" /> {/* Slightly more visible separator */}
             </section>


            {/* Main Grid - Calculator or Login Prompt */}
            {isAuthenticated ? (
                <section className="w-full grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start mb-20"> {/* Increased gap, margin */}
                    <div className="lg:col-span-3">
                        <ElasticityForm
                            onCalculationStart={handleCalculationStart}
                            onCalculationEnd={handleCalculationEnd}
                        />
                    </div>
                    <div className="lg:col-span-2 lg:sticky lg:top-24"> {/* Make results sticky, adjust top offset */}
                        <ElasticityResult result={result} isLoading={isLoading} inputData={lastInput} /> {/* Pass inputData */}
                    </div>
                </section>
            ) : (
                <section className="flex justify-center mb-20"> {/* Increased margin */}
                    <Card className="w-full max-w-lg text-center p-8 bg-card border rounded-xl shadow-lg-custom"> {/* Use large custom shadow */}
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold">Get Started</CardTitle>
                            <CardDescription>Please log in or sign up to use the Price Elasticity Calculator.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row justify-center gap-4 mt-2"> {/* Added top margin */}
                            <Button asChild size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"> {/* Added shadows */}
                                <Link href="/login" className="flex items-center justify-center gap-1.5">
                                    <LogIn size={18} />
                                    Login
                                </Link>
                            </Button>
                            <Button variant="outline" asChild size="lg" className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow"> {/* Added shadows */}
                                <Link href="/signup" className="flex items-center justify-center gap-1.5">
                                    <UserPlus size={18} />
                                    Sign Up
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Understanding Elasticity Section */}
            <section className="w-full mb-16">
                <Card className="shadow-lg-custom rounded-xl border-border/60 bg-card"> {/* Use large custom shadow */}
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                            <BookOpen size={22} /> Understanding Elasticity
                        </CardTitle>
                         <CardDescription>Interpret your Price Elasticity of Demand (PED) result:</CardDescription>
                    </CardHeader>
                    <CardContent className="text-base text-muted-foreground space-y-4 px-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <p><strong className="font-medium text-foreground">Elastic (PED &gt; 1):</strong> Demand is highly responsive to price changes. A price decrease could significantly boost quantity sold.</p>
                            <p><strong className="font-medium text-foreground">Inelastic (0 &lt; PED &lt; 1):</strong> Demand is relatively unresponsive to price changes. A price increase might lead to higher revenue.</p>
                            <p><strong className="font-medium text-foreground">Unit Elastic (PED = 1):</strong> Percentage change in quantity demanded matches the percentage change in price. Revenue is likely maximized.</p>
                            <p><strong className="font-medium text-foreground">Perfectly Inelastic (PED = 0):</strong> Quantity demanded remains constant regardless of price (rare, e.g., essential goods).</p>
                            <p><strong className="font-medium text-foreground">Perfectly Elastic (PED = ∞):</strong> Consumers demand infinite quantity at a specific price, but none above (theoretical).</p>
                        </div>
                    </CardContent>
                </Card>
            </section>

        </main>

        {/* Footer */}
        <footer className="py-8 border-t bg-background/80"> {/* Increased padding, slight transparency */}
            <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground gap-4"> {/* Added gap */}
                <p>&copy; {new Date().getFullYear()} PriceLens. All rights reserved.</p>
                <nav className="flex gap-6"> {/* Increased gap */}
                    {/* Add other footer links like Privacy Policy, Terms of Service if needed */}
                    <Link href="#" className="hover:text-primary hover:underline underline-offset-4 transition-colors"> {/* Placeholder */}
                        Privacy Policy
                    </Link>
                     <Link href="#" className="hover:text-primary hover:underline underline-offset-4 transition-colors"> {/* Placeholder */}
                        Terms of Service
                    </Link>
                    <Link href="#" className="hover:text-primary hover:underline underline-offset-4 transition-colors flex items-center gap-1">
                        <Phone size={14} /> Contact Us
                    </Link>
                </nav>
            </div>
        </footer>
    </div>
  );
}


