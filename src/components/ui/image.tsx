import { Image as ExpoImage } from 'expo-image';
import { cssInterop } from 'nativewind';

/** expo-image with NativeWind className support. */
export const Image = cssInterop(ExpoImage, { className: 'style' });
