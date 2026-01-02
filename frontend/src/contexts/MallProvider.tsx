import { createContext, useContext, useState } from "react";

const MallContext = createContext<any>(null);

export const useMall = () => useContext(MallContext);

export const MallProvider = ({ children }: any) => {
  const [nearbyMalls, setNearbyMalls] = useState([]);
  const [selectedMall, setSelectedMall] = useState<any>(null);

  return (
    <MallContext.Provider
      value={{ nearbyMalls, setNearbyMalls, selectedMall, setSelectedMall }}
    >
      {children}
    </MallContext.Provider>
  );
};
