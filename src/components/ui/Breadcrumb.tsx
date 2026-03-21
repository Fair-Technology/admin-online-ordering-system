import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 mb-4 text-sm flex-wrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
            {isLast || !item.to ? (
              <span className="text-gray-900">{item.label}</span>
            ) : (
              <Link to={item.to} className="text-gray-400 hover:text-gray-700 transition-colors">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
