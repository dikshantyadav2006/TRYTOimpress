export { Button, type ButtonProps } from "./components/button";
export { ImageAsset, type ImageAssetProps } from "./components/image-asset";
export {
  MusicProvider,
  MusicStoreContext,
  useMusicStore,
  type MusicProviderProps,
} from "./components/music-provider";
export { MusicToggle, type MusicToggleProps } from "./components/music-toggle";
export {
  TextReveal,
  BlurReveal,
  ScaleReveal,
  FloatingHearts,
  ConfettiLayer,
  HeartRain,
  MagneticButton,
  ParallaxImage,
  PageTransition,
  CursorFollower,
  Typing,
  LoadingScreen,
  ProgressBar,
  type TextRevealProps,
  type TextRevealTag,
  type BlurRevealProps,
  type BlurRevealTag,
  type ScaleRevealProps,
  type ScaleRevealTag,
  type FloatingHeartsProps,
  type ConfettiLayerProps,
  type HeartRainProps,
  type MagneticButtonProps,
  type ParallaxImageProps,
  type PageTransitionProps,
  type TypingProps,
  type LoadingScreenProps,
} from "./components/animations";
export { FloatingMessages } from "./components/floating-messages";
export { Hero, type HeroProps } from "./components/hero";
export { ImagePlaceholder, type ImagePlaceholderProps } from "./components/image-placeholder";
export { NoButton } from "./components/no-button";
export { ProposalCard, type ProposalCardProps } from "./components/proposal-card";
export { SuccessScreen, type SuccessScreenProps } from "./components/success-screen";
export { YesButton, type YesButtonProps } from "./components/yes-button";

export { useFloatingHearts, type HeartParticle } from "./hooks/use-floating-hearts";
export { useMounted } from "./hooks/use-mounted";
export { useNoButtonEscape, type NoButtonEscape } from "./hooks/use-no-button-escape";
export { useWindowSize, type WindowSize } from "./hooks/use-window-size";

export { cn } from "./lib/cn";
export { vibrate, type HapticPattern } from "./lib/haptics";
export { getMelodySrc } from "./lib/melody";

export {
  createProposalStore,
  type NoButtonPosition,
  type ProposalStoreApi,
  type ProposalStoreState,
} from "./store/proposal-store";
export { StoreProvider, type StoreProviderProps } from "./store/store-provider";
export { useProposalStore } from "./store/use-proposal-store";
export {
  createQuestionsStore,
  type QuestionsStoreApi,
  type QuestionsState,
} from "./store/questions-store";
export {
  QuestionsProvider,
  type QuestionsProviderProps,
} from "./store/questions-provider";
export { useQuestionsStore } from "./store/use-questions-store";
export {
  createMusicStore,
  type MusicStoreApi,
  type MusicStoreState,
} from "./store/music-store";
export { useNavigationStore } from "./store/navigation-store";

export type { AnimationState } from "./store/proposal-store";
