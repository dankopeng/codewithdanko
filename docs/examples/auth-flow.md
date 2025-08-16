# Authentication Flow Example

This example demonstrates how to implement a complete authentication flow in a CodeWithDanko application.

## User Registration

### Frontend Component

```tsx
// app/routes/register.tsx
import { useState } from 'react';
import { Form, useActionData, redirect } from '@remix-run/react';
import { json } from '@remix-run/cloudflare';
import { Button, Input, Card, Alert } from '@codewithdanko/ui';
import { registerUser } from '~/lib/api';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const name = formData.get('name');

  try {
    const { token, user } = await registerUser({ email, password, name });
    
    // Store the token in the session
    return redirect('/dashboard', {
      headers: {
        'Set-Cookie': `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`
      }
    });
  } catch (error) {
    return json({ error: error.message });
  }
};

export default function Register() {
  const actionData = useActionData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <Card.Header>
          <Card.Title>Create an Account</Card.Title>
          <Card.Description>Sign up to get started with CodeWithDanko</Card.Description>
        </Card.Header>
        <Card.Content>
          {actionData?.error && (
            <Alert variant="error" className="mb-4">
              {actionData.error}
            </Alert>
          )}
          
          <Form method="post" onSubmit={() => setIsSubmitting(true)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1"
                />
              </div>
              
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Create Account
              </Button>
            </div>
          </Form>
        </Card.Content>
        <Card.Footer className="text-center">
          <p className="text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
}
```

### API Client

```tsx
// app/lib/api.ts
const API_BASE = '/api';

export async function registerUser({ email, password, name }) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Registration failed');
  }

  return response.json();
}
```

## User Login

### Frontend Component

```tsx
// app/routes/login.tsx
import { useState } from 'react';
import { Form, useActionData, redirect } from '@remix-run/react';
import { json } from '@remix-run/cloudflare';
import { Button, Input, Card, Alert, Checkbox } from '@codewithdanko/ui';
import { loginUser } from '~/lib/api';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const remember = formData.get('remember') === 'on';

  try {
    const { token, user } = await loginUser({ email, password });
    
    // Set cookie max age based on "remember me" option
    const maxAge = remember ? 604800 : 86400; // 7 days or 1 day
    
    return redirect('/dashboard', {
      headers: {
        'Set-Cookie': `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`
      }
    });
  } catch (error) {
    return json({ error: error.message });
  }
};

export default function Login() {
  const actionData = useActionData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <Card.Header>
          <Card.Title>Welcome Back</Card.Title>
          <Card.Description>Sign in to your account</Card.Description>
        </Card.Header>
        <Card.Content>
          {actionData?.error && (
            <Alert variant="error" className="mb-4">
              {actionData.error}
            </Alert>
          )}
          
          <Form method="post" onSubmit={() => setIsSubmitting(true)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Checkbox id="remember" name="remember" label="Remember me" />
                <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Sign In
              </Button>
            </div>
          </Form>
        </Card.Content>
        <Card.Footer className="text-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Create one
            </a>
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
}
```

### API Client

```tsx
// app/lib/api.ts (continued)
export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Login failed');
  }

  return response.json();
}
```

## Authentication Context

Create an authentication context to manage user state throughout the application:

```tsx
// app/lib/useAuth.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetcher = useFetcher();

  useEffect(() => {
    // Fetch the current user on initial load
    fetcher.load('/api/auth/me');
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      setUser(fetcher.data.user || null);
      setIsLoading(false);
    }
  }, [fetcher.data]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## Protected Routes

Create a middleware to protect routes that require authentication:

```tsx
// app/lib/auth.server.ts
import { redirect } from '@remix-run/cloudflare';

export async function requireAuth(request) {
  const authToken = request.headers.get('Cookie')?.match(/auth-token=([^;]+)/)?.[1];
  
  if (!authToken) {
    throw redirect('/login');
  }
  
  try {
    // Verify the token by making a request to the API
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw redirect('/login');
    }
    
    const { user } = await response.json();
    return user;
  } catch (error) {
    throw redirect('/login');
  }
}
```

Use the middleware in protected routes:

```tsx
// app/routes/dashboard.tsx
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { requireAuth } from '~/lib/auth.server';
import { useAuth } from '~/lib/useAuth';
import { Button } from '@codewithdanko/ui';

export const loader = async ({ request }) => {
  const user = await requireAuth(request);
  return json({ user });
};

export default function Dashboard() {
  const { user } = useLoaderData();
  const { logout } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      
      <Button onClick={logout} variant="outline" className="mt-4">
        Sign Out
      </Button>
    </div>
  );
}
```

## Backend Implementation

Here's the backend Worker implementation for the authentication endpoints:

```typescript
// apps/api/src/routes/auth.ts
import { Router } from 'itty-router';
import { sign, verify } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';

const router = Router();

// Register a new user
router.post('/register', async (request, env) => {
  try {
    const { email, password, name } = await request.json();
    
    // Check if user already exists
    const existingUser = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: 'User already exists' } 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Insert user
    const result = await env.DB.prepare(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?) RETURNING id, email, name'
    ).bind(email, hashedPassword, name).first();
    
    // Generate JWT token
    const token = sign(
      { userId: result.id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User registered successfully',
        user: { id: result.id, email: result.email, name: result.name },
        token
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: 'Registration failed' } 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Login
router.post('/login', async (request, env) => {
  try {
    const { email, password } = await request.json();
    
    // Find user
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: 'Invalid credentials' } 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify password
    const isPasswordValid = await compare(password, user.password);
    
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: 'Invalid credentials' } 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate JWT token
    const token = sign(
      { userId: user.id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return new Response(
      JSON.stringify({ 
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        token
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: 'Login failed' } 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Get current user
router.get('/me', async (request, env) => {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: 'Unauthorized' } 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verify(token, env.JWT_SECRET);
    
    // Get user
    const user = await env.DB.prepare(
      'SELECT id, email, name FROM users WHERE id = ?'
    ).bind(decoded.userId).first();
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: 'User not found' } 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        user
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: 'Authentication failed' } 
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Logout (server-side)
router.post('/logout', async () => {
  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Logged out successfully'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});

export default router;
```

## Complete Authentication Flow

1. User registers or logs in through the frontend forms
2. Backend validates credentials and returns a JWT token
3. Frontend stores the token in an HttpOnly cookie
4. Protected routes check for the token and redirect to login if missing
5. The auth context provides user information and logout functionality throughout the app

This example demonstrates a secure, production-ready authentication system using JWT tokens with Authorization header for API requests.
