import { Home, Search, ClipboardList, MessageSquare, User, Package, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

export default function BottomNav() {
  const { role } = useApp();

  const mechanicLinks = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: ClipboardList, label: 'Requests', path: '/orders' },
    { icon: MessageSquare, label: 'Chat', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const sellerLinks = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: MessageSquare, label: 'Chat', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const links = role === 'mechanic' ? mechanicLinks : sellerLinks;

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card border-t border-border px-6 py-3 flex justify-between items-center z-50">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) => `flex flex-col items-center gap-1 min-h-12 min-w-12 justify-center transition-colors ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <link.icon size={24} />
          <span className="text-[10px] font-medium">{link.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
