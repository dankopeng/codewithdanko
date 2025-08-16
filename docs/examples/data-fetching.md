# Data Fetching and State Management Example

This example demonstrates how to implement data fetching and state management in a CodeWithDanko application.

## Data Fetching with Remix Loaders

### User Profile Page

```tsx
// app/routes/profile.tsx
import { json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { Card, Avatar } from '@codewithdanko/ui';
import { requireAuth } from '~/lib/auth.server';
import { getUserProfile } from '~/lib/api';

// Server-side data loading
export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure user is authenticated
  const user = await requireAuth(request);
  
  // Get the auth token from cookies
  const authToken = request.headers.get('Cookie')?.match(/auth-token=([^;]+)/)?.[1];
  
  // Fetch user profile data
  const profile = await getUserProfile(authToken);
  
  return json({ profile });
}

export default function ProfilePage() {
  const { profile } = useLoaderData<typeof loader>();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <Card.Header className="flex items-center gap-4">
          <Avatar 
            src={profile.avatarUrl} 
            fallback={profile.name.charAt(0)} 
            size="large" 
          />
          <div>
            <Card.Title>{profile.name}</Card.Title>
            <Card.Description>{profile.email}</Card.Description>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Bio</h3>
              <p className="text-gray-600">{profile.bio || 'No bio provided'}</p>
            </div>
            <div>
              <h3 className="font-medium">Location</h3>
              <p className="text-gray-600">{profile.location || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-medium">Member Since</h3>
              <p className="text-gray-600">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
```

### API Client

```typescript
// app/lib/api.ts
export async function getUserProfile(token: string | undefined) {
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch('/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  
  const data = await response.json();
  return data.user;
}
```

## Client-Side Data Fetching with SWR

For client-side data fetching with automatic revalidation, we can use SWR:

```tsx
// app/lib/swr.tsx
import { createContext, useContext, ReactNode } from 'react';
import useSWR, { SWRConfig, SWRResponse } from 'swr';

// Create a fetcher function that includes auth token
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('API request failed');
  }
  
  return response.json();
};

// Create SWR provider
export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}

// Custom hook for data fetching
export function useApi<T>(path: string): SWRResponse<T, Error> {
  return useSWR<T, Error>(path);
}
```

### Dashboard with Real-time Data

```tsx
// app/routes/dashboard.tsx
import { useState } from 'react';
import { json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { Card, Tabs, Button } from '@codewithdanko/ui';
import { requireAuth } from '~/lib/auth.server';
import { useApi } from '~/lib/swr';
import { DashboardStats } from '~/components/DashboardStats';
import { ActivityFeed } from '~/components/ActivityFeed';

// Initial server-side data loading
export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure user is authenticated
  const user = await requireAuth(request);
  
  return json({ user });
}

// Dashboard component with client-side data fetching
export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch dashboard stats with SWR for real-time updates
  const { data: stats, error: statsError, mutate: refreshStats } = useApi('/api/dashboard/stats');
  
  // Fetch activity feed with SWR
  const { data: activities, error: activitiesError } = useApi('/api/dashboard/activities');
  
  const isLoading = !stats || !activities;
  const hasError = statsError || activitiesError;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => refreshStats()} variant="outline">
          Refresh Data
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        </Tabs.List>
        
        <div className="mt-6">
          {hasError && (
            <Card className="mb-6 bg-red-50 border-red-200">
              <Card.Content>
                <p className="text-red-600">
                  Failed to load dashboard data. Please try again.
                </p>
              </Card.Content>
            </Card>
          )}
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <Tabs.Content value="overview">
                <DashboardStats stats={stats} />
              </Tabs.Content>
              
              <Tabs.Content value="activity">
                <ActivityFeed activities={activities} />
              </Tabs.Content>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
}
```

## Form Handling with Remix Actions

### Profile Edit Form

```tsx
// app/routes/profile.edit.tsx
import { useState } from 'react';
import { json, redirect, ActionFunctionArgs } from '@remix-run/cloudflare';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { Button, Input, Textarea, Alert } from '@codewithdanko/ui';
import { requireAuth } from '~/lib/auth.server';
import { updateUserProfile } from '~/lib/api';

// Handle form submission
export async function action({ request }: ActionFunctionArgs) {
  // Ensure user is authenticated
  const user = await requireAuth(request);
  
  // Get form data
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;
  const location = formData.get('location') as string;
  
  // Validate input
  const errors: Record<string, string> = {};
  
  if (!name || name.trim() === '') {
    errors.name = 'Name is required';
  }
  
  if (Object.keys(errors).length > 0) {
    return json({ errors, values: { name, bio, location } });
  }
  
  try {
    // Get the auth token
    const authToken = request.headers.get('Cookie')?.match(/auth-token=([^;]+)/)?.[1];
    
    // Update profile
    await updateUserProfile(authToken, { name, bio, location });
    
    // Redirect back to profile page
    return redirect('/profile');
  } catch (error) {
    return json({ 
      errors: { form: 'Failed to update profile' },
      values: { name, bio, location }
    });
  }
}

export default function EditProfilePage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
        
        {actionData?.errors?.form && (
          <Alert variant="error" className="mb-6">
            {actionData.errors.form}
          </Alert>
        )}
        
        <Form method="post">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <Input
                id="name"
                name="name"
                defaultValue={actionData?.values?.name || ''}
                error={actionData?.errors?.name}
              />
              {actionData?.errors?.name && (
                <p className="text-sm text-red-600 mt-1">
                  {actionData.errors.name}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">
                Bio
              </label>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={actionData?.values?.bio || ''}
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <Input
                id="location"
                name="location"
                defaultValue={actionData?.values?.location || ''}
              />
            </div>
            
            <div className="flex gap-4">
              <Button type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
              <Button type="button" variant="outline" as="a" href="/profile">
                Cancel
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
```

## Backend Implementation

### User Profile API

```typescript
// apps/api/src/routes/users.ts
import { Router } from 'itty-router';
import { verifyAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all user routes
router.all('*', verifyAuth);

// Get user profile
router.get('/profile', async (request, env) => {
  try {
    const { userId } = request.user;
    
    const user = await env.DB.prepare(`
      SELECT id, email, name, bio, location, created_at
      FROM users
      WHERE id = ?
    `).bind(userId).first();
    
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
        error: { message: 'Failed to fetch profile' } 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Update user profile
router.put('/profile', async (request, env) => {
  try {
    const { userId } = request.user;
    const { name, bio, location } = await request.json();
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { message: 'Name is required' } 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Update user in database
    await env.DB.prepare(`
      UPDATE users
      SET name = ?, bio = ?, location = ?
      WHERE id = ?
    `).bind(name, bio || null, location || null, userId).run();
    
    // Get updated user
    const updatedUser = await env.DB.prepare(`
      SELECT id, email, name, bio, location, created_at
      FROM users
      WHERE id = ?
    `).bind(userId).first();
    
    return new Response(
      JSON.stringify({ 
        success: true,
        user: updatedUser
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { message: 'Failed to update profile' } 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

export default router;
```

## Root Layout with SWR Provider

```tsx
// app/root.tsx
import { useState, useEffect } from 'react';
import { json } from '@remix-run/cloudflare';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { ThemeProvider } from '@codewithdanko/ui';
import { SWRProvider } from '~/lib/swr';
import { AuthProvider } from '~/lib/useAuth';

export const loader = async () => {
  return json({
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
    },
  });
};

export default function App() {
  const { ENV } = useLoaderData<typeof loader>();
  const [theme, setTheme] = useState('light');
  
  // Check for user's preferred theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
    }
  }, []);
  
  return (
    <html lang="en" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider defaultTheme={theme} onThemeChange={setTheme}>
          <SWRProvider>
            <AuthProvider>
              <Outlet />
            </AuthProvider>
          </SWRProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
      </body>
    </html>
  );
}
```

## Complete Data Flow

1. **Server-side data loading** with Remix loaders for initial page load
2. **Client-side data fetching** with SWR for real-time updates and optimistic UI
3. **Form handling** with Remix actions for data mutations
4. **State management** with React context for global state like authentication and theme
5. **Error handling** at both server and client levels

This example demonstrates a comprehensive approach to data fetching and state management in a CodeWithDanko application, leveraging Remix's built-in data loading capabilities combined with client-side libraries for optimal user experience.
