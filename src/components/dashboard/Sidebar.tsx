import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Plus,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'New Campaign',
      href: '/dashboard/campaign/new',
      icon: Plus,
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-[#242526] border-r border-[#343536]">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-[#343536]">
        <MessageSquare className="w-6 h-6 text-[#FF4500]" />
        <span className="text-xl font-bold text-white">RedditLeads</span>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-[#FF4500] text-white'
                  : 'text-gray-400 hover:bg-[#343536] hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Settings */}
      <div className="absolute bottom-0 w-full p-4 border-t border-[#343536]">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#343536] hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </div>
  );
}