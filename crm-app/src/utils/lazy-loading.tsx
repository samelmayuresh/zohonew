import React, { Suspense, lazy, ComponentType } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Generic lazy loading wrapper with error boundary
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Role-based lazy loading for dashboard components
export const LazyDashboards = {
  SuperAdmin: createLazyComponent(
    () => import('@/components/dashboard/SuperAdminDashboard'),
    <div>Loading Super Admin Dashboard...</div>
  ),
  Admin: createLazyComponent(
    () => import('@/components/dashboard/AdminDashboard'),
    <div>Loading Admin Dashboard...</div>
  ),
  SalesManager: createLazyComponent(
    () => import('@/components/dashboard/SalesManagerDashboard'),
    <div>Loading Sales Manager Dashboard...</div>
  ),
  SalesExecutive: createLazyComponent(
    () => import('@/components/dashboard/SalesExecutiveDashboard'),
    <div>Loading Sales Executive Dashboard...</div>
  ),
  SupportAgent: createLazyComponent(
    () => import('@/components/dashboard/SupportAgentDashboard'),
    <div>Loading Support Agent Dashboard...</div>
  ),
  Customer: createLazyComponent(
    () => import('@/components/dashboard/CustomerPortal'),
    <div>Loading Customer Portal...</div>
  ),
};

// Lazy load form components
export const LazyForms = {
  CreateUser: createLazyComponent(
    () => import('@/components/users/CreateUserForm')
  ),
  CreateLead: createLazyComponent(
    () => import('@/components/leads/CreateLeadForm')
  ),
  CreateTask: createLazyComponent(
    () => import('@/components/tasks/CreateTaskForm')
  ),
};

// Lazy load list components
export const LazyLists = {
  UserList: createLazyComponent(
    () => import('@/components/users/UserList')
  ),
  LeadList: createLazyComponent(
    () => import('@/components/leads/LeadList')
  ),
  TaskList: createLazyComponent(
    () => import('@/components/tasks/TaskList')
  ),
};

// Preload components based on user role
export const preloadComponentsForRole = (role: string) => {
  const preloadMap: Record<string, (() => Promise<any>)[]> = {
    super_admin: [
      () => import('@/components/dashboard/SuperAdminDashboard'),
      () => import('@/components/users/CreateUserForm'),
      () => import('@/components/users/UserList'),
      () => import('@/components/leads/CreateLeadForm'),
      () => import('@/components/leads/LeadList'),
      () => import('@/components/tasks/CreateTaskForm'),
      () => import('@/components/tasks/TaskList'),
    ],
    admin: [
      () => import('@/components/dashboard/AdminDashboard'),
      () => import('@/components/users/UserList'),
      () => import('@/components/leads/LeadList'),
      () => import('@/components/tasks/TaskList'),
    ],
    sales_manager: [
      () => import('@/components/dashboard/SalesManagerDashboard'),
      () => import('@/components/leads/LeadList'),
      () => import('@/components/tasks/TaskList'),
    ],
    sales_executive: [
      () => import('@/components/dashboard/SalesExecutiveDashboard'),
      () => import('@/components/leads/LeadList'),
      () => import('@/components/tasks/TaskList'),
    ],
    support_agent: [
      () => import('@/components/dashboard/SupportAgentDashboard'),
      () => import('@/components/tasks/TaskList'),
    ],
    customer: [
      () => import('@/components/dashboard/CustomerPortal'),
    ],
  };

  const componentsToPreload = preloadMap[role] || [];
  
  // Preload components in the background
  componentsToPreload.forEach(importFn => {
    importFn().catch(err => {
      console.warn('Failed to preload component:', err);
    });
  });
};

// Resource hints for critical resources
export const addResourceHints = () => {
  if (typeof window === 'undefined') return;

  const head = document.head;
  
  // Preconnect to API server
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'http://localhost:8000';
  head.appendChild(preconnect);
  
  // DNS prefetch for external resources
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = '//fonts.googleapis.com';
  head.appendChild(dnsPrefetch);
};

// Image lazy loading utility
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}> = ({ src, alt, className, placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+' }) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={() => setIsLoaded(true)}
      style={{
        opacity: isLoaded ? 1 : 0.7,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
};