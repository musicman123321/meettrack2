import React from "react";
import { Bell, Home, Search, Settings, User, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../../../../supabase/auth";
import { Link } from "react-router-dom";

interface TopNavigationProps {
  onSearch?: (query: string) => void;
  notifications?: Array<{ id: string; title: string }>;
  onSettingsClick?: () => void;
}

const TopNavigation = ({
  onSearch = () => {},
  notifications = [
    { id: "1", title: "Meet in 30 days - Check equipment" },
    { id: "2", title: "Weight cut reminder" },
  ],
  onSettingsClick = () => {},
}: TopNavigationProps) => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full h-16 border-b border-gray-700 bg-gray-800 flex items-center justify-between px-4 fixed top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <Link
          to="/"
          className="flex items-center gap-2 text-white hover:text-gray-300"
        >
          <Dumbbell className="h-5 w-5 text-red-500" />
          <span className="font-semibold">Meet Prep Tracker</span>
        </Link>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search lifts, equipment..."
            className="pl-8 h-9 text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-gray-800 border-gray-700"
                >
                  <DropdownMenuLabel className="text-white">
                    Notifications
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="py-2 text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      {notification.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettingsClick}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.email || ""}
                />
                <AvatarFallback className="bg-red-600 text-white">
                  {user.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-sm">
                {user.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-gray-800 border-gray-700"
          >
            <DropdownMenuLabel className="text-white">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="py-2 text-gray-300 hover:text-white hover:bg-gray-700">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2 text-gray-300 hover:text-white hover:bg-gray-700">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              onSelect={() => signOut()}
              className="py-2 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopNavigation;
