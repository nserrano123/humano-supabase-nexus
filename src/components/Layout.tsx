import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ClipboardList 
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Job Positions", href: "/jobs", icon: Briefcase },
  { name: "Recruitment", href: "/recruitment", icon: ClipboardList },
  { name: "Prospects", href: "/prospects", icon: Users },
  { name: "Agents", href: "/agents", icon: Users },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/f8ecd123-b0df-4541-aea0-a92ff0ade3b9.png" 
              alt="Fail Fast Logo" 
              className="h-8 w-8"
            />
            <h1 className="text-xl font-bold text-ff-primary">Fail Fast</h1>
          </div>
        </div>
        <nav className="mt-6">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ff-neutral text-ff-primary border-r-2 border-ff-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}