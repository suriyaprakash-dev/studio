'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Send, Mail } from 'lucide-react'; // Added Mail icon

// Define the validation schema using Zod
const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  subject: z.string().min(1, { message: 'Subject is required' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type ContactFormInput = z.infer<typeof formSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
    mode: 'onChange', // Validate on change
  });

  // Placeholder onSubmit handler
  const onSubmit: SubmitHandler<ContactFormInput> = async (data) => {
    setIsSubmitting(true);
    console.log("Contact form data:", data); // Log form data

    // Simulate API call to send message
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you'd send this data to your backend API
    toast({
      title: "Message Sent (Simulated)",
      description: "Thank you for contacting us! We'll get back to you soon.",
      variant: "default",
    });

    form.reset(); // Reset form after successful submission
    setIsSubmitting(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary/30">
      <Card className="w-full max-w-lg shadow-xl rounded-xl border-border/60">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
            <Mail size={28} /> Contact Us
          </CardTitle>
          <CardDescription>Have questions or feedback? Send us a message!</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Question about pricing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                       <Textarea
                          placeholder="Your message here..."
                          className="min-h-[120px]" // Set a minimum height
                          {...field}
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-3 rounded-lg transition-transform transform hover:scale-105 mt-4">
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} className="mr-2"/>
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col justify-center items-center pt-4 pb-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
                Prefer to go back?{' '}
                <Link href="/" className="font-medium text-primary hover:underline underline-offset-4">
                  Return Home
                </Link>
            </p>

        </CardFooter>
      </Card>
        <footer className="mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PriceLens. We aim to respond within 24 hours.</p>
        </footer>
    </main>
  );
}
