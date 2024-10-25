import Swiper from "../../../../src/swiper";
import "./index.less";

type ListType = {
  color: string;
};

const Base1 = () => {
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
          width: 160,
          height: 400,
          paddingLeft: 20,
        }}
      >
        {color}
      </div>
    );
  };
  return (
    <div className="wrap">
      <Swiper<ListType> list={list} renderItem={renderItem} fullContent />
    </div>
  );
};

export default Base1;
