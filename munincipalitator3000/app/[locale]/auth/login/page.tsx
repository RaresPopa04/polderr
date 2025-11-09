'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/routing';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: username,
                    password: password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Login failed');
            }

            const data = await response.json();
            // Store the token
            localStorage.setItem('auth_token', data.access_token);
            // Store the username
            localStorage.setItem('username', username);
            
            // Redirect to home and refresh to update navbar
            window.location.href = '/';
        } catch (err: any) {
            setError(err.message || 'Failed to log in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f1419] flex items-center justify-center p-6">
            <Card className="w-full max-w-md border-2 border-[#4A8EC6]/20 shadow-xl dark:border-[#5B9ED3]/20">
                <CardHeader>
                    <CardTitle className="text-2xl text-[#4A8EC6] dark:text-[#5B9ED3]">Log In</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full bg-[#4A8EC6] hover:bg-[#5B9ED3] dark:bg-[#5B9ED3] dark:hover:bg-[#7CB8E8]"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </Button>

                        <div className="text-center text-sm text-zinc-700 dark:text-zinc-300">
                            Don't have an account?{' '}
                            <Link href="/auth/signup" className="text-[#4A8EC6] dark:text-[#7CB8E8] hover:underline font-medium">
                                Sign up
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

