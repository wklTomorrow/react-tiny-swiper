import React, { useCallback, useEffect, useRef, useState } from "react";

const isMobile = (() => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent);
})();

/**
 * react 滚动组件，支持自动滚动无限滚动
 * 如果页面元素存在margin-left则表示右边有填充，并且与左边持平
 * 如果存在填充，应当禁止自动轮播、无限滚动
 */
export const useSwiper = <T>({
  list = [],
  bounce = 0.1,
  endBounce = 0.3,
  autoPlay = false,
  autoPlayDuration = 3000,
  infinite = false,
  scale = 0,
  fullContent = false,
  initial = 0,
  transitionDuration = 300,
  disabledLeftAndRight = false,
  startTouch,
  endTouch,
  triggerActive,
  triggerMovedActive,
  scrollEnd,
}: {
  list: Array<T>;
  bounce?: number;
  endBounce?: number;
  autoPlay?: boolean;
  autoPlayDuration?: number;
  infinite?: boolean;
  scale?: number; // 是否缩放，缩放比例请用小数点
  fullContent?: boolean;
  initial?: number; // 初始位置
  transitionDuration?: number;
  disabledLeftAndRight?: boolean;
  scrollEnd?: (...args: any[]) => void;
  startTouch?: (...args: any[]) => void;
  endTouch?: (...args: any[]) => void;
  triggerActive?: (params: number) => void;
  triggerMovedActive?: (params: number) => void;
}) => {
  const left = useRef<number>(0);
  const toucheEle = useRef<any>(null);
  const wrapEle = useRef<HTMLDivElement>(null);
  const moving = useRef(false);
  const movingSwiper = useRef(false);
  const touchIndex = useRef(-1);
  const pageX = useRef(0);
  const pageY = useRef(0);
  const pageMove = useRef(0);
  const hasMove = useRef(0);
  const autoMoveTimer = useRef<any>(null);
  const activeIndex = useRef(initial);
  const nextActiveIndex = useRef(-1);
  const dealRightGutter = useRef<{
    endWidth: number;
    got: boolean;
  }>({
    got: false,
    endWidth: 0,
  });
  const startTouchRef = useRef(false);
  const childWidthRef = useRef(0);
  const isBounce = useRef(false);
  const clearedTimer = useRef(false);
  const [_, _update] = useState(0);
  const [swiperList, setSwiperList] = useState<Array<T>>([]);

  const setActiveIndex = (active: number) => {
    if (active >= 0 && active < list.length) {
      triggerActive?.(active);
    }
    activeIndex.current = active;
  };

  const getBouncePostion = () =>
    (touchIndex.current === 0 && hasMove.current < 0) ||
    (touchIndex.current === list.length - 1 && hasMove.current > 0);

  const clearTimer = () => {
    if (autoMoveTimer.current) {
      clearTimeout(autoMoveTimer.current);
      autoMoveTimer.current = null;
    }
  };

  const getChildWidth = () => {
    if (childWidthRef.current) {
      return childWidthRef.current;
    }
    return (childWidthRef.current = parseFloat(
      window.getComputedStyle(wrapEle.current?.children[0] as HTMLElement)
        .width || "0"
    ));
  };

  const setStyle = () => {
    wrapEle.current?.setAttribute(
      "style",
      `transform: translateX(${-left.current.toFixed(2)}px)`
    );
  };

  const setTransform = (dom: HTMLElement, scale: number) => {
    dom.setAttribute(
      "style",
      `transform: scale(${scale});transition-duration:0ms;`
    );
  };

  const setTranslateScale = (dom: HTMLElement, scale = 1) => {
    dom.setAttribute(
      "style",
      `transform: scale(${scale});transition-duration: ${transitionDuration}ms;`
    );
  };

  const done = () => {
    moving.current = false;
    hasMove.current = 0;
    pageX.current = -1;
    pageY.current = -1;
    touchIndex.current = -1;
    startTouchRef.current = false;
    nextActiveIndex.current = -1;
  };

  const setTranslate = (bounce = false, reset = false) => {
    const width = getChildWidth() || 0;
    const nextIndex = infinite
      ? nextActiveIndex.current + 1
      : nextActiveIndex.current;
    let next = nextIndex * width;

    const curIndex = infinite ? activeIndex.current + 1 : activeIndex.current;
    let cur = curIndex * width;

    if (
      hasMove.current > 0 &&
      activeIndex.current === list.length - 2 &&
      fullContent
    ) {
      next =
        width * (nextActiveIndex.current - 1) +
        dealRightGutter.current.endWidth;
    }
    if (
      hasMove.current !== 0 &&
      activeIndex.current === list.length - 1 &&
      fullContent
    ) {
      cur =
        width * (activeIndex.current - 1) + dealRightGutter.current.endWidth;
    }

    if (reset) {
      left.current = 0;
    } else {
      left.current = bounce ? cur : next;
    }
    let nextActive =
      nextActiveIndex.current === list.length ? 0 : nextActiveIndex.current;
    if (nextActiveIndex.current === -1) {
      nextActive = list.length - 1;
    }
    triggerMovedActive?.(bounce ? activeIndex.current : nextActive);

    isBounce.current = bounce;

    if (scale) {
      const child = [...(wrapEle.current?.children as HTMLCollection)];
      const index =
        child[curIndex] && child[curIndex].hasAttribute("data-same")
          ? Number(child[curIndex].getAttribute("data-same"))
          : -1;
      const nextIndexSame =
        child[nextIndex] && child[nextIndex].hasAttribute("data-same")
          ? Number(child[nextIndex].getAttribute("data-same"))
          : -1;
      setTranslateScale(child[curIndex] as HTMLElement, bounce ? 1 : scale);
      child[index] &&
        setTranslateScale(child[index] as HTMLElement, bounce ? 1 : scale);
      child[nextIndex] &&
        setTranslateScale(child[nextIndex] as HTMLElement, !bounce ? 1 : scale);
      child[nextIndexSame] &&
        setTranslateScale(
          child[nextIndexSame] as HTMLElement,
          !bounce ? 1 : scale
        );
    }

    wrapEle.current?.setAttribute(
      "style",
      `transform: translateX(${-left.current.toFixed(
        2
      )}px); transition-duration: ${transitionDuration}ms;`
    );
  };

  const setScaleStyle = useCallback(
    (move: number) => {
      if (wrapEle.current) {
        if (scale) {
          const endWidth = dealRightGutter.current.endWidth;
          const child = [...wrapEle.current.children];
          let width = (child[0] as HTMLElement).offsetWidth;
          if (endWidth) {
            if (
              hasMove.current >= 0 &&
              activeIndex.current === list.length - 2
            ) {
              width = endWidth;
            }
            if (
              hasMove.current < 0 &&
              activeIndex.current === list.length - 1
            ) {
              width = endWidth;
            }
          }
          const scalePrecent = (1 - scale) / width;
          const trueIndex = infinite
            ? activeIndex.current + 1
            : activeIndex.current;
          if (child[trueIndex]) {
            const change = 1 - move * scalePrecent;
            setTransform(child[trueIndex] as HTMLElement, change);
            const index = child[trueIndex].getAttribute("data-same") || -1;
            if (child[Number(index)]) {
              setTransform(child[Number(index)] as HTMLElement, change);
            }
          }
          const next = infinite
            ? nextActiveIndex.current + 1
            : nextActiveIndex.current;

          if (child[next]) {
            const change = scale + move * scalePrecent;
            setTransform(child[next] as HTMLElement, change);
            const index = child[next].getAttribute("data-same") || -1;
            if (child[Number(index)]) {
              setTransform(child[Number(index)] as HTMLElement, change);
            }
          }
        }
      }
    },
    [scale, infinite]
  );

  const handleTouchStart = (
    e: React.TouchEvent | React.MouseEvent,
    index: number
  ) => {
    if (list.length < 2) {
      return;
    }
    clearTimer();
    clearedTimer.current = true;
    if (
      moving.current ||
      (isMobile && (e as React.TouchEvent).touches.length > 1)
    ) {
      return;
    }
    console.log(111);
    startTouchRef.current = true;
    moving.current = true;
    addEventlistener(e.target as Element);
    pageX.current = isMobile
      ? (e as React.TouchEvent).targetTouches[0].pageX
      : (e as React.MouseEvent).pageX;
    pageY.current = isMobile
      ? (e as React.TouchEvent).targetTouches[0].pageY
      : (e as React.MouseEvent).pageY;
    toucheEle.current = e.target as Element;
    pageMove.current = pageX.current;
    touchIndex.current = index;
    movingSwiper.current = false;
  };

  const touchmove = (e: Event) => {
    if (moving.current) {
      const X = isMobile
        ? (e as TouchEvent).targetTouches[0].pageX
        : (e as MouseEvent).pageX;
      const Y = isMobile
        ? (e as TouchEvent).targetTouches[0].pageY
        : (e as MouseEvent).pageY;
      if (
        Math.abs(pageX.current - X) > Math.abs(pageY.current - Y) ||
        movingSwiper.current ||
        !isMobile
      ) {
        hasMove.current = pageMove.current - X;
        if (disabledLeftAndRight && !infinite) {
          if (
            (hasMove.current < 0 && activeIndex.current === 0) ||
            (hasMove.current > 0 && activeIndex.current === list.length - 1)
          ) {
            scrollEnd?.();
            done();
            return;
          }
        }
        if (startTouchRef.current) {
          startTouchRef.current = false;
          startTouch?.(activeIndex.current);
        }
        movingSwiper.current = true;
        const oldV = pageX.current;
        pageX.current = X;
        const moveLen = oldV - X;
        const curLeft = Number(left.current.toFixed(3));
        if (
          !infinite &&
          getBouncePostion() &&
          (isMobile
            ? (e as TouchEvent).changedTouches[0]?.clientX
            : (e as MouseEvent).clientX)
        ) {
          left.current = curLeft + moveLen * endBounce;
        } else {
          left.current = curLeft + moveLen;
        }
        const x = isMobile
          ? (e as TouchEvent).changedTouches[0]?.pageX
          : (e as MouseEvent).pageX;
        if (x) {
          if (!infinite && getBouncePostion()) {
            hasMove.current = (pageMove.current - x) * endBounce;
          } else {
            hasMove.current = pageMove.current - x;
          }
        }
        e.stopPropagation();
        if (typeof e.cancelable !== "boolean" || e.cancelable) {
          e.preventDefault();
        }

        if (hasMove.current > 0) {
          nextActiveIndex.current = activeIndex.current + 1;
        } else {
          nextActiveIndex.current = activeIndex.current - 1;
        }

        setScaleStyle(Math.abs(hasMove.current));

        setStyle();
      } else {
        if (!movingSwiper.current) {
          moving.current = false;
        }
      }
      pageX.current = X;
      pageY.current = Y;
    }
  };

  const getGutter = () => {
    if (fullContent && !dealRightGutter.current.got && wrapEle.current) {
      const firstEl = wrapEle.current.children[0]?.children[0];
      const marginLeft = parseFloat(
        (getComputedStyle(firstEl) as any)["margin-left"]
      );
      dealRightGutter.current = {
        got: true,
        endWidth:
          firstEl.clientWidth * 2 +
          marginLeft * 3 -
          wrapEle.current.offsetWidth,
      };
    }
  };

  const touchend = (e: Event) => {
    removeEventListener(e.target as Element);
    if (!moving.current) {
      return;
    }

    if (wrapEle.current) {
      if (getBouncePostion() && !infinite) {
        setTranslate(true);
        return;
      }
      getGutter();

      const width = getChildWidth() || 0;
      if (Math.abs(hasMove.current) > width * bounce) {
        setTranslate();
        return;
      } else {
        if (hasMove.current) {
          setTranslate(true);
        } else {
          moving.current = false;
        }
      }
    }
  };

  const addEventlistener = (dom: Element) => {
    if (isMobile) {
      dom.addEventListener("touchmove", touchmove, { passive: false });
      dom.addEventListener("touchend", touchend, { passive: false });
    } else {
      dom.addEventListener("mousemove", touchmove, { passive: false });
      dom.addEventListener("mouseup", touchend, { passive: false });
      window.addEventListener("mouseup", touchend, { passive: false });
    }
  };

  const removeEventListener = (dom: Element) => {
    if (isMobile) {
      dom.removeEventListener("touchmove", touchmove);
      dom.removeEventListener("touchend", touchend);
    } else {
      dom.removeEventListener("mousemove", touchmove);
      dom.removeEventListener("mouseup", touchend);
      window.removeEventListener("mouseup", touchend);
    }
  };

  const circle = () => {
    if (list.length < 2) {
      return;
    }
    if (autoPlay) {
      autoMoveTimer.current = setTimeout(() => {
        clearTimer();
        moving.current = true;
        nextActiveIndex.current = activeIndex.current + 1;
        startTouch?.(activeIndex.current);
        getGutter();
        if (infinite) {
          hasMove.current = 1;
          return setTranslate();
        } else {
          if (activeIndex.current < list.length - 1) {
            hasMove.current = 1;
            setTranslate();
          } else {
            activeIndex.current = 0;
            setTranslate(false, true);
            _update((old) => old + 1);
          }
        }
      }, autoPlayDuration);
    }
  };

  useEffect(() => {
    if (list.length) {
      if (infinite && list.length > 1) {
        const end = list[list.length - 1];
        const first = list[0];
        const oldList = [...list];
        oldList.unshift(end);
        oldList.push(first);
        setSwiperList(oldList);
      } else {
        setSwiperList(list);
      }
    }
  }, [list.length, infinite]);

  useEffect(() => {
    /**
     * 目前强制展示的第一张
     */
    if (wrapEle.current && swiperList.length) {
      const child = [...wrapEle.current.children];
      if (child?.length) {
        if (swiperList.length > 1) {
          if (infinite) {
            left.current = getChildWidth() * (initial + 1) || 0;
            setStyle();
          } else {
            left.current = getChildWidth() * initial || 0;
            setStyle();
          }
        }

        if (scale) {
          let sameIndex = -1;
          child.forEach((ele, index) => {
            if (infinite) {
              if (index === activeIndex.current + 1) {
                sameIndex =
                  child[index] && child[index].hasAttribute("data-same")
                    ? Number(child[index].getAttribute("data-same"))
                    : -1;
              } else {
                setTransform(ele as HTMLElement, scale);
              }
            } else {
              if (index !== activeIndex.current) {
                setTransform(ele as HTMLElement, scale);
              }
            }
          });
          if (sameIndex > -1) {
            setTransform(child[sameIndex] as HTMLElement, 1);
          }
        }
      }
      setActiveIndex(initial);
    }
  }, [scale, swiperList.length, infinite, initial]);

  const swiperTo = (index: number) => {
    clearTimer();
    if (list.length === 1 || moving.current) {
      return;
    }
    if (index >= -1 && index !== activeIndex.current) {
      moving.current = true;
      startTouch?.(activeIndex.current);
      let targetIndex = index;
      if (!infinite && targetIndex >= list.length) {
        targetIndex = list.length - 1;
        done();
      }

      const moveLen = activeIndex.current - targetIndex;
      nextActiveIndex.current = targetIndex;
      hasMove.current = moveLen > 0 ? -1 : 1;
      setTranslate();
    }
  };

  const transitionend = (e: TransitionEvent) => {
    if (e.propertyName === "transform" && wrapEle.current) {
      const style = wrapEle.current.getAttribute("style") || "";
      wrapEle.current.setAttribute(
        "style",
        style?.replace(/transition-duration:\s(\d+)ms/, (obj, res) => {
          return obj.replace(res, "0");
        })
      );
      const width = getChildWidth() || 0;
      if (!isBounce.current) {
        if (hasMove.current > 0) {
          setActiveIndex(activeIndex.current + 1);
        } else if (hasMove.current < 0) {
          setActiveIndex(activeIndex.current - 1);
        }
        if (infinite) {
          if (activeIndex.current === -1) {
            setActiveIndex(list.length - 1);
            left.current = width * list.length;
          } else if (activeIndex.current === list.length) {
            setActiveIndex(0);
            left.current = width;
          }
          setStyle();
        }
      }

      if (autoPlay && !clearedTimer.current) {
        circle();
      }

      endTouch?.();

      _update((old) => old + 1);

      done();
    }
  };

  useEffect(() => {
    if (autoPlay) {
      circle();
    }
    wrapEle.current?.addEventListener("transitionend", transitionend);
    return () => {
      if (toucheEle.current) {
        removeEventListener(toucheEle.current as Element);
      }
      wrapEle.current?.removeEventListener("transitionend", transitionend);
    };
  }, []);

  return {
    handleTouchStart,
    swiperTo,
    swiperList,
    wrapEle,
    activeIndex,
  };
};
