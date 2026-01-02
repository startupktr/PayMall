import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Search, Menu } from 'lucide-react';
import { getUserLocation } from "@/lib/location";
import { useMall } from "@/contexts/MallProvider";
import api from "@/api/axios";

// Two separate banner arrays
const banners1 = [
  { id: 1, title: "Exclusive Offers", subtitle: "Get 20% off on selected items", color: "from-purple-500 to-indigo-600", image: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=300&h=200" },
  { id: 2, title: "New Collection", subtitle: "Check out latest arrivals", color: "from-orange-400 to-pink-500", image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=300&h=200" },
  { id: 3, title: "Special Offers", subtitle: "Check out special offers", color: "from-pink-400 to-red-500", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&h=200" },
];

const banners2 = [
  { id: 4, title: "Special Offers", subtitle: "Check out special offers", color: "from-pink-400 to-red-500", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&h=200" },
  { id: 5, title: "Weekend Deals", subtitle: "Limited time offers", color: "from-green-400 to-blue-500", image: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=300&h=200" },
  { id: 6, title: "Exclusive Offers", subtitle: "Get 20% off on selected items", color: "from-purple-500 to-indigo-600", image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=300&h=200" },
];

const malls = [
  { id: 1, name: "CityKart", image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=300&h=200" },
  { id: 2, name: "VMart", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=300&h=200" },
  { id: 3, name: "Trends", image: "https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?auto=format&fit=crop&w=300&h=200" },
  { id: 4, name: "V2", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&h=200" },
  { id: 5, name: "1 India", image: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=300&h=200" },
];

const BannerSlider = ({ banners }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [banners]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-3 relative">
      <div className="overflow-hidden rounded-xl">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {banners.map((banner:any) => (
            <div key={banner.id} className="min-w-full p-4 h-36 flex-shrink-0 bg-gradient-to-r rounded-xl relative overflow-hidden" style={{ backgroundImage: banner.image ? `url(${banner.image})` : undefined }}>
              <div className={cn("absolute inset-0 bg-gradient-to-r", banner.color, banner.image ? "opacity-70" : "")}></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white">{banner.title}</h3>
                <p className="text-white text-opacity-90 mt-1">{banner.subtitle}</p>
                <button className="mt-4 bg-white text-sm px-4 py-2 rounded-full font-medium">Shop Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-4 gap-2">
        {banners.map((_:any, index:any) => (
          <button key={index} onClick={() => setActiveIndex(index)} className={`w-2 h-2 rounded-full transition-all ${index === activeIndex ? "bg-paymall-primary w-6" : "bg-gray-300"}`}></button>
        ))}
      </div>
    </motion.div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [showAllMalls, setShowAllMalls] = useState(false);
  const [nearbyMalls, setNearbyMalls] = useState<any[]>([]);
  const { selectedMall, setSelectedMall } = useMall();
  
  useEffect(() => {
    const init = async () => {
      try {
        const cached = localStorage.getItem("coords");

        if (cached) {
          const coords = JSON.parse(cached);
          const res = await api.post("/products/malls/nearby/", coords);
          setNearbyMalls(res.data);
          return; // stop here, no permission popup
        }

        const coords = await getUserLocation();

        localStorage.setItem("coords", JSON.stringify(coords));

        // Fetch nearby malls
        const res = await api.post("/products/malls/nearby/", coords);
        setNearbyMalls(res.data);
      } catch (error) {
        console.error("Failed to fetch nearby malls", error);
        setNearbyMalls([]);
      }
    };

    if (!selectedMall) {
      init();
    }
  }, [selectedMall]);


  return (
    <div className="pb-20 min-h-screen bg-paymall-light">
      <Header showLocation showNotification showProfile profileImageUrl="https://randomuser.me/api/portraits/men/32.jpg" />
      <main className="max-w-md mx-auto px-4">
        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-3">
          <div className="flex items-center px-4 py-3 bg-[#f1e3fe] rounded-full space-x-2">
            <Menu className="w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search Products" className="bg-transparent outline-none flex-grow text-sm placeholder-gray-500" />
            <Search className="w-5 h-5 text-gray-500" />
          </div>
        </motion.div>

        {/* Two Banner Sliders */}
        <BannerSlider banners={banners1} />
        <BannerSlider banners={banners2} />

        {/* Malls Nearby Section */}
        <section className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Malls Nearby</h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Slice(0, 3) shows only the first 3 items if showAllMalls is false */}
            {nearbyMalls
              .slice(0, showAllMalls ? nearbyMalls.length : 3)
              .map((mall: any) => (
                <button key={mall.id} className="bg-white p-2 rounded-xl shadow-sm text-center"
                onClick={() => setSelectedMall(mall)}
                >
                  <img src={mall.image} alt={mall.name} className="w-full h-20 object-cover rounded-md mb-2" />
                  <p className="text-sm font-medium">{mall.name}</p>
                  <p className="text-sm text-gray-500">{mall.distance} km away</p>
                </button>
              ))}
          </div>
          
          {/* Only show the button if there are more than 3 malls */}
          {nearbyMalls.length > 3 && (
            <button 
              onClick={() => setShowAllMalls(!showAllMalls)} 
              className="mt-4 w-full text-center text-sm font-medium text-paymall-primary"
            >
              {showAllMalls ? "Show Less" : "View All"}
            </button>
          )}
        </section>

        {nearbyMalls.length === 0 && (
          <div
            className="p-4 bg-white rounded-xl shadow-soft cursor-pointer"
          >
            <p className="font-medium text-centre">No Malls found nearby</p>
          </div>
        )}

        {/* Recent Scans */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-3 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Scans</h3>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-soft">
            <div className="text-center py-6">
              <p className="text-gray-500">No recent scans</p>
              <button
                onClick={() => navigate('/scan')}
                className="mt-3 bg-paymall-primary text-white px-6 py-2 rounded-lg text-sm font-medium"
              >
                Scan Products
              </button>
            </div>
          </div>
        </motion.div>
      </main>
      <Navigation />
    </div>
  );
};

export default HomePage;
