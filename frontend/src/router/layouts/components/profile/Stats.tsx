import { profileStats } from "@/src/router/styles";



type MatchData = {
  win: number;
  lose: number;
};

interface StatsProps {
  title: string;
  data: MatchData;
}

const Stats = ({ title, data }: StatsProps) => {
  return (
    <>
      <div className={`${profileStats}`}>
        <div className="title">{title}</div>
        <div className="d-flex flex-row matches">
          <div className="">Matches</div>
          <div className="p-1 bg-secondary"></div>
          <div className="">{data.lose + data.win}</div>
        </div>
        <div className="d-flex flex-row wins">
          <div className="">Wins</div>
          <div className="p-1 bg-secondary"></div>
          <div className="">{data.win}</div>
        </div>
        <div className="d-flex flex-row loses">
          <div className="">Loses</div>
          <div className="p-1 bg-secondary"></div>
          <div className="">{data.lose}</div>
        </div>
      </div>
    </>
  );
};

export default Stats;
