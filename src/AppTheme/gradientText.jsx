import MaskedView from "@react-native-masked-view/masked-view";
import LinearGradient from "react-native-linear-gradient";
import { Colors } from "../AppTheme/color";
import ResponsiveText from "../component/ResponsiveText";
import { View, StyleSheet } from "react-native";

const GradientText = ({ text, size = "regular", fontWeight = "700" , colors=Colors.primaryGradiyant}) => (
  <MaskedView
    maskElement={
      <View style={styles.center}>
        <ResponsiveText
          size={size}
          fontWeight={fontWeight}
          style={{ color: "black" }}
        >
          {text}
        </ResponsiveText>
      </View>
    }
  >
    <LinearGradient
      colors={colors}
      start={{ x: 0.25, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    />
  </MaskedView>
);

const styles = StyleSheet.create({
  center: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  gradient: {
    height: 20, // Adjust to match your text size
    width: 60, // Adjust to match the text width
  },
});

export default GradientText;
