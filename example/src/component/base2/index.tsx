import Swiper from "../../../../src/swiper";
import "./index.less";

type ListType = {
  color: string;
};

const Base2 = () => {
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
    <div className="wrap">
      <Swiper<ListType>
        list={list}
        renderItem={renderItem}
        infinite
        initial={1}
        autoPlay
      />
    </div>
  );
};

export default Base2;
