'use client'

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbItems(pathname);

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <StyledWrapper>
      <nav className="breadcrumb-nav">
        <ol className="breadcrumb-list">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="breadcrumb-item">
              {index < breadcrumbItems.length - 1 ? (
                <>
                  {item.href ? (
                    <Link href={item.href} className="breadcrumb-link">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="breadcrumb-text">{item.label}</span>
                  )}
                  <span className="breadcrumb-separator">
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="9,18 15,12 9,6"/>
                    </svg>
                  </span>
                </>
              ) : (
                <span className="breadcrumb-current">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </StyledWrapper>
  );
};

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }];

  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip the first 'dashboard' segment as it's already covered by Home
    if (segment === 'dashboard') {
      return;
    }

    const label = formatSegmentLabel(segment);
    const isLast = index === pathSegments.length - 1;
    
    items.push({
      label,
      href: isLast ? undefined : currentPath
    });
  });

  return items;
}

function formatSegmentLabel(segment: string): string {
  // Convert kebab-case and snake_case to Title Case
  return segment
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const StyledWrapper = styled.div`
  .breadcrumb-nav {
    padding: 16px 0;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 24px;
  }

  .breadcrumb-list {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
    gap: 4px;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .breadcrumb-link {
    color: #6b7280;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s ease;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .breadcrumb-link:hover {
    color: #3b82f6;
    background-color: #f8fafc;
  }

  .breadcrumb-text {
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
    padding: 4px 8px;
  }

  .breadcrumb-current {
    color: #1f2937;
    font-size: 14px;
    font-weight: 600;
    padding: 4px 8px;
    background-color: #f3f4f6;
    border-radius: 4px;
  }

  .breadcrumb-separator {
    color: #9ca3af;
    display: flex;
    align-items: center;
    font-size: 12px;
  }

  .breadcrumb-separator svg {
    width: 12px;
    height: 12px;
  }

  @media (max-width: 768px) {
    .breadcrumb-nav {
      padding: 12px 0;
    }

    .breadcrumb-link,
    .breadcrumb-text,
    .breadcrumb-current {
      font-size: 13px;
      padding: 2px 6px;
    }

    .breadcrumb-separator svg {
      width: 10px;
      height: 10px;
    }
  }
`;

export default Breadcrumb;