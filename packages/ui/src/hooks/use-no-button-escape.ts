"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
  type TouchEvent,
} from "react";

import { useProposalStore } from "../store/use-proposal-store";
import { useWindowSize } from "./use-window-size";

const PADDING = 20;
const BUTTON_WIDTH_FALLBACK = 112;
const BUTTON_HEIGHT_FALLBACK = 48;

export interface NoButtonEscape {
  isFleeing: boolean;
  fleeCount: number;
  wrapperRef: RefObject<HTMLDivElement | null>;
  buttonRef: RefObject<HTMLButtonElement | null>;
  wrapperStyle: CSSProperties | undefined;
  offset: { x: number; y: number };
  onPointerEnter: (event: PointerEvent<HTMLButtonElement>) => void;
  onTouchStart: (event: TouchEvent<HTMLButtonElement>) => void;
  onKeyDown: () => void;
}

export function useNoButtonEscape(): NoButtonEscape {
  const noButtonPosition = useProposalStore((state) => state.noButtonPosition);
  const noButtonFleeCount = useProposalStore((state) => state.noButtonFleeCount);
  const moveNoButton = useProposalStore((state) => state.moveNoButton);

  const { width, height } = useWindowSize();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [anchored, setAnchored] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (noButtonPosition === null && anchored) {
      setAnchored(false);
      setAnchor({ x: 0, y: 0 });
    }
  }, [noButtonPosition, anchored]);

  const computeTarget = useCallback((): { x: number; y: number } => {
    const element = buttonRef.current;
    const buttonWidth = element?.offsetWidth ?? BUTTON_WIDTH_FALLBACK;
    const buttonHeight = element?.offsetHeight ?? BUTTON_HEIGHT_FALLBACK;
    const maxX = Math.max(PADDING, width - buttonWidth - PADDING);
    const maxY = Math.max(PADDING, height - buttonHeight - PADDING);
    return {
      x: PADDING + Math.random() * (maxX - PADDING),
      y: PADDING + Math.random() * (maxY - PADDING),
    };
  }, [width, height]);

  const flee = useCallback(() => {
    if (!anchored && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setAnchor({ x: rect.left, y: rect.top });
      setAnchored(true);
    }
    moveNoButton(computeTarget());
  }, [anchored, computeTarget, moveNoButton]);

  const onPointerEnter = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== "mouse") return;
      flee();
    },
    [flee],
  );

  const onTouchStart = useCallback(
    (event: TouchEvent<HTMLButtonElement>) => {
      event.preventDefault();
      flee();
    },
    [flee],
  );

  const onKeyDown = useCallback(() => {
    flee();
  }, [flee]);

  const offset = noButtonPosition
    ? { x: noButtonPosition.x - anchor.x, y: noButtonPosition.y - anchor.y }
    : { x: 0, y: 0 };

  const wrapperStyle: CSSProperties | undefined = anchored
    ? {
        position: "fixed",
        left: anchor.x,
        top: anchor.y,
        zIndex: 60,
        margin: 0,
      }
    : undefined;

  return {
    isFleeing: noButtonPosition !== null,
    fleeCount: noButtonFleeCount,
    wrapperRef,
    buttonRef,
    wrapperStyle,
    offset,
    onPointerEnter,
    onTouchStart,
    onKeyDown,
  };
}
