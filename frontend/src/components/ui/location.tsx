import { useNavigate } from "react-router-dom";
import { ChevronDown, MapPin } from "lucide-react";

type Props = {
  user: string;
  address: string;
};

export default function Location({ user, address }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-start gap-2 cursor-pointer"
      onClick={() => navigate("/set-location")}
    >
      <MapPin className="w-5 h-5 text-red-500 mt-1" />
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-gray-900">{user}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        <p className="text-xs text-gray-500 truncate max-w-[180px]">
          {address}
        </p>
      </div>
    </div>
  );
}
