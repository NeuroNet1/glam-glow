import MaskedView from "@react-native-masked-view/masked-view";
import LinearGradient from "react-native-linear-gradient";
import { Image } from "react-native";
import { Colors } from "../AppTheme/color";

const GradientIcon = ({ source, size = 25 }) => (
  <MaskedView
    maskElement={
      <Image
        source={source}
        style={{ width: size, height: size, tintColor: Colors.black }}
        resizeMode="contain"
      />
    }
  >
    <LinearGradient
      colors={Colors.primaryGradiyant}
      start={{ x: 0.25, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size }}
    />
  </MaskedView>
);
export default GradientIcon;
