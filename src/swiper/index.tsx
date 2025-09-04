import React, {
  FC,
  ForwardedRef,
  ReactNode,
  Ref,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./index.less";
import { isMobile, useSwiper } from "./hook";

export type SwiperMethods = {
  swiperTo: (...args: any) => void;
  next: (...args: any) => void;
  pre: (...args: any) => void;
};

export type SwiperProps<T> = {
  list: Array<T>;
  autoPlay?: boolean;
  autoPlayDuration?: number;
  infinite?: boolean;
  showPage?: boolean;
  scale?: number;
  fullContent?: boolean;
  initial?: number;
  transitionDuration?: number;
  disabledLeftAndRight?: boolean;
  clickItem?: (params: T) => void
  renderItem: (params: T, index: number) => ReactNode;
  triggerActive?: (params: number) => void;
  startTouch?: (...args: any[]) => void;
  endTouch?: (...args: any[]) => void;
  scrollEnd?: (...args: any[]) => void;
  triggerMovedActive?: (params: number) => void;
};

function Swiper<T>(
  {
    list = [],
    autoPlay = false,
    autoPlayDuration = 3000,
    infinite = false,
    showPage = false,
    scale = 0,
    fullContent = false,
    initial,
    transitionDuration,
    disabledLeftAndRight = false,
    renderItem,
    triggerActive,
    startTouch,
    endTouch,
    triggerMovedActive,
    scrollEnd,
    clickItem,
  }: SwiperProps<T>,
  ref: ForwardedRef<SwiperMethods>
) {
  const { handleTouchStart, swiperTo, wrapEle, activeIndex, swiperList } =
    useSwiper<T>({
      list,
      autoPlay,
      autoPlayDuration,
      infinite,
      scale,
      fullContent,
      initial,
      transitionDuration,
      disabledLeftAndRight,
      startTouch,
      endTouch,
      triggerActive,
      triggerMovedActive,
      scrollEnd,
      clickItem,
    });

  useImperativeHandle(
    ref,
    () => {
      return {
        swiperTo(num: number) {
          swiperTo(num);
        },
        next() {
          if (infinite) {
            swiperTo(activeIndex.current + 1);
          } else {
            if (activeIndex.current === list.length - 1) {
              return;
            } else {
              swiperTo(activeIndex.current + 1);
            }
          }
        },
        pre() {
          if (infinite) {
            swiperTo(activeIndex.current - 1);
          } else {
            if (activeIndex.current === 0) {
              return;
            } else {
              swiperTo(activeIndex.current - 1);
            }
          }
        },
      };
    },
    []
  );

  const getDataSame = (i: number) => {
    if (i === 0) {
      return swiperList.length - 2;
    }
    if (i === 1) {
      return swiperList.length - 1;
    }
    if (i === swiperList.length - 1) {
      return 1;
    }
    if (i === swiperList.length - 2) {
      return 0;
    }
  };

  return (
    <div className={"wrap-swipper"}>
      <div className={"swiper"} ref={wrapEle}>
        {swiperList.map((i, index) => (
          <div
            key={index}
            className={"swiper-item"}
            {...(isMobile
              ? {
                  onTouchStart: (e) => {
                    handleTouchStart(e, index);
                  },
                }
              : {
                  onMouseDown: (e) => {
                    handleTouchStart(e, index);
                  },
                })}
            {...(infinite && list.length > 1 && scale
              ? {
                  "data-same": getDataSame(index),
                }
              : {})}
          >
            {/* 如果是无限滚动的效果，需要复制最后一个到第一位，原来的第一位需要粘贴到末尾 */}
            {renderItem(i, infinite && list.length > 1 ? index - 1 : index)}
          </div>
        ))}
      </div>
      {list.length > 1 && showPage && (
        <div className={"item"}>
          {activeIndex.current + 1}/{list.length}
        </div>
      )}
    </div>
  );
}

export default forwardRef(Swiper) as <T>(
  props: SwiperProps<T> & { ref?: Ref<SwiperMethods> }
) => JSX.Element;
