
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CreditCard, ScanBarcode, ClipboardList, ShoppingCart } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/payment-setup', icon: CreditCard, label: 'Payment' },
    { path: '/scan', icon: ScanBarcode, label: 'Scan' },
    { path: '/transactions', icon: ClipboardList, label: 'Orders' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] rounded-t-xl z-50">
      <div className="flex justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`py-3 px-3 flex flex-1 flex-col items-center justify-center ${
                isActive ? 'text-paymall-primary' : 'text-gray-500'
              }`}
            >
              <item.icon
                size={24}
                className={isActive ? 'text-paymall-primary' : 'text-gray-500'}
              />
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-6 h-1 bg-paymall-primary rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
