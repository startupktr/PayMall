import { useNavigate } from "react-router-dom";
import { ChevronLeft, Bell } from "lucide-react";
import Location from "@/components/ui/location";
import { useAuth } from "@/contexts/AuthContext";

type HeaderProps = {
  title?: string;
  showLocation?: boolean;
  showBack?: boolean;
  showProfile?: boolean;
  showNotification?: boolean;
  profileImageUrl?: string;
};

const Header = ({
  title,
  showLocation = false,
  showBack = false,
  showProfile = false,
  showNotification = false,
  profileImageUrl,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between h-16 px-2 max-w-md mx-auto">
        {/* Left Section: Back, Title & Location */}
        <div className="flex items-start gap-3 w-full max-w-[70%]">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 mt-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className="flex flex-col overflow-hidden my-auto">
            {title && (
              <h1 className="font-semibold text-base text-gray-900 truncate">
                {title}
              </h1>
            )}

            {showLocation && (
              <div className="truncate text-sm text-gray-600">
                <Location
                  user="Vishal Kumar"
                  address="22142, Floor 14, Tower 22, Prestige Ferns Residency, HSR Layout, Bangalore, Karnataka, 560102"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Notifications & Profile */}
        <div className="flex items-center gap-3">
          {showNotification && (
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-6 w-6 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}

          {showProfile && (
            <button
              // onClick={() => navigate("/profile")}
              onClick={() => {logout(); navigate("/login")}}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 overflow-hidden"
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
