import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState } from 'react';
import { trpc } from './utils/trpc';
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import Login from './router/Login';
import Layout from './layout';
import { useCookies } from 'react-cookie';
import Home from './router/Home';
import ErrorPage from './ErrorPage';
import "animate.css"
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children : [
      {
        path : "/",
        element : <Home/>
      },
      {
        path : "/login", 
        element : <Login/>
      },
      
    ],
    errorElement : <ErrorPage/>
  },
  
]);

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    trpc.createClient({
      
      links: [
        httpBatchLink({
          url: '/api/trpc',
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            });
          },
         
          
        }),
      ],
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
       
          <RouterProvider router={router} />
       
      </QueryClientProvider>
    </trpc.Provider>
  );
}