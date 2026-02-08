import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  name: string;
  image?: string | null;
  tagline?: string;
  distance?: number;
  onPress?: () => void;
};

export default function MallCard({
  name,
  image,
  tagline = "Shopping • Food • Fashion",
  distance,
  onPress,
}: Props) {
  const { theme } = useTheme();

  const firstLetter = name.charAt(0).toUpperCase();

  const formattedDistance =
    distance !== undefined
      ? distance >= 1000
        ? `${(distance / 1000).toFixed(1)} km`
        : `${Math.round(distance)} m`
      : null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Image */}
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              backgroundColor:
                theme.colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.placeholderText,
              { color: theme.colors.text },
            ]}
          >
            {firstLetter}
          </Text>
        </View>
      )}

      <Text
        numberOfLines={1}
        style={[
          styles.name,
          { color: theme.colors.text },
        ]}
      >
        {name}
      </Text>

      <Text
        numberOfLines={1}
        style={[
          styles.tagline,
          { color: theme.colors.textSecondary },
        ]}
      >
        {tagline}
      </Text>

      {formattedDistance && (
        <Text
          style={[
            styles.distance,
            { color: theme.colors.primary },
          ]}
        >
          {formattedDistance} away
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 14,
    marginBottom: 10,
  },
  placeholder: {
    width: "100%",
    height: 100,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: "800",
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
  },
  tagline: {
    fontSize: 12,
    marginTop: 2,
  },
  distance: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
});
