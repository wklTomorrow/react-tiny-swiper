import Swiper from "../../../../src/swiper";
import "./index.less";

type ListType = {
  color: string;
};

const Base3 = () => {
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
        }}
      >
        {color}
      </div>
    );
  };
  return (
    <>
      <div className="wrap" style={{ paddingLeft: 18 }}>
        <Swiper<ListType> list={list} renderItem={renderItem} scale={0.92} infinite />
      </div>
    </>
  );
};

export default Base3;
