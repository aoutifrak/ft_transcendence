interface CircleProps {
  coordinates: {
    xPercent: string;
    yPercent: string;
  };
  size: {
    width: string;
    height: string;
  };
  backgroundGradiant: {
    deg?: string;
    first?: string;
    second?: string;
  };
  className: string;
}

const Circle = ({
  coordinates: { xPercent, yPercent },
  size: { width, height },
  backgroundGradiant: { deg, first, second },
  className,
}: CircleProps) => {
  return (
    <>
      <div
        className={`${className}`}
        style={{
          position: "absolute",
          left: xPercent,
          top: yPercent,
          width: width,
          height: height,
          borderRadius: "100%",
          background: "linear-gradient(to right, gray , orangered)",
        }}
      >
        <div
          className=" w-100 h-100 rounded-circle"
          style={{
            background: `linear-gradient(${deg}deg, #03062E ${first}%, #5F0A94 ${second}%)`,
          }}
        ></div>
      </div>
    </>
  );
};

const BackgroundCircles = () => {
  return (
    <>
      <Circle
        className="p-1 opacity-50"
        coordinates={{ xPercent: "50%", yPercent: "-50px" }}
        size={{ width: "80px", height: "80px" }}
        backgroundGradiant={{ deg: "180", first: "0", second: "150.71" }}
      />
      <Circle
        className="p-1 opacity-75"
        coordinates={{ xPercent: "15%", yPercent: "15%" }}
        size={{ width: "80px", height: "80px" }}
        backgroundGradiant={{ deg: "180", first: "20", second: "150.71" }}
      />
      <Circle
        className="p-1 opacity-25"
        coordinates={{ xPercent: "25%", yPercent: "30%" }}
        size={{ width: "60px", height: "60px" }}
        backgroundGradiant={{ deg: "180", first: "0", second: "150.71" }}
      />
      <Circle
        className="opacity-25 p-1"
        coordinates={{ xPercent: "40%", yPercent: "25%" }}
        size={{ width: "30px", height: "30px" }}
        backgroundGradiant={{ deg: "180", first: "0", second: "150.71" }}
      />
      <Circle
        className="p-1 opacity-25"
        coordinates={{ xPercent: "50%", yPercent: "35%" }}
        size={{ width: "30px", height: "30px" }}
        backgroundGradiant={{ deg: "180", first: "0", second: "150.71" }}
      />
      <Circle
        className="p-1 opacity-50"
        coordinates={{ xPercent: "70%", yPercent: "35%" }}
        size={{ width: "80px", height: "80px" }}
        backgroundGradiant={{ deg: "180", first: "0", second: "150.71" }}
      />
      <Circle
        className="p-1 opacity-50 "
        coordinates={{ xPercent: "75%", yPercent: "0%" }}
        size={{ width: "40px", height: "40px" }}
        backgroundGradiant={{ deg: "180", first: "20", second: "150.71" }}
      />
      <Circle
        className="p-1 opacity-50"
        coordinates={{ xPercent: "-10px", yPercent: "70%" }}
        size={{ width: "80px", height: "80px" }}
        backgroundGradiant={{ deg: "180", first: "0", second: "150.71" }}
      />
      <Circle
        className="p-1 opacity-50"
        coordinates={{ xPercent: "70%", yPercent: "95%" }}
        size={{ width: "80px", height: "80px" }}
        backgroundGradiant={{ deg: "180", first: "-50", second: "150.71" }}
      />
    </>
  );
};

export default BackgroundCircles;