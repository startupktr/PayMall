import { createContext, useContext, useState } from "react";

const LocationContext = createContext<any>(null);

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }: any) => {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [label, setLabel] = useState<string>("");

  return (
    <LocationContext.Provider value={{ coords, setCoords, label, setLabel }}>
      {children}
    </LocationContext.Provider>
  );
};
