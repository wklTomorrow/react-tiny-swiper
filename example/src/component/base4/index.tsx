import { useRef } from "react";
import Swiper, { SwiperMethods } from "../../../../src/swiper";
import "./index.less";

type ListType = {
  color: string;
};

const Base4 = () => {
  const SwiperRef = useRef<SwiperMethods>(null);
  const list = [
    {
      color: "red",
    },
    {
      color: "blue",
    },
    {
      color: "yellow",
    },
    {
      color: "gray",
    },
  ];
  const renderItem = ({ color }: ListType) => {
    return (
      <div
        style={{
          background: color,
          width: 200,
          height: 400,
        }}
      >
        {color}
      </div>
    );
  };
  return (
    <>
      <div className="wrap">
        <Swiper<ListType>
          ref={SwiperRef}
          list={list}
          renderItem={renderItem}
          infinite
        />
      </div>
      <div>
        <button
          onClick={() => {
            SwiperRef.current?.pre();
          }}
        >
          pre
        </button>
        <button
          onClick={() => {
            SwiperRef.current?.next();
          }}
        >
          next
        </button>
      </div>
    </>
  );
};

export default Base4;
