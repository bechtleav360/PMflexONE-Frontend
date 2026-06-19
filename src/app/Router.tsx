import { Suspense } from 'react'

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'

import { Layout } from '@/widgets/Layout'

import {
  adminRoutes,
  documentRoutes,
  generalRoutes,
  notFoundRoute,
  portfolioRoutes,
  programRoutes,
  projectRoutes,
} from './routeGroups'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      {generalRoutes}
      {projectRoutes}
      {portfolioRoutes}
      {programRoutes}
      {documentRoutes}
      {adminRoutes}
      {notFoundRoute}
    </Route>,
  ),
)

/**
 * Defines the client-side route table for the application.
 * @returns A RouterProvider containing all application routes.
 */
export function Router() {
  return (
    <Suspense
      fallback={
        <div
          aria-busy="true"
          className="p-xl flex min-h-full items-center justify-center"
        />
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  )
}
