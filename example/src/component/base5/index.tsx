import { useRef } from "react";
import Swiper, { SwiperMethods } from "../../../../src/swiper";
import "./index.less";

type ListType = {
  color: string;
};

const Base5 = () => {
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
          marginLeft: 20,
        }}
      >
        {color}
      </div>
    );
  };
  return (
    <>
      <div className="con">
        <div
          className="wrap1"
          style={{
            marginLeft: -20,
            boxSizing: "border-box",
          }}
        >
          <Swiper<ListType>
            ref={SwiperRef}
            list={list}
            renderItem={renderItem}
          />
        </div>
      </div>
    </>
  );
};

export default Base5;
