import { friends, robot, tournament } from "@/media-exporting";
import { gameModeInGame, gameModeInGameSlides } from "../../styles";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const changeToRight = () => {
  const nodes = document.querySelectorAll(`.slides`);
  const parent = document.querySelector(`.${gameModeInGameSlides}`);
  parent?.insertBefore(nodes[2], nodes[0]);
};
const changeToLeft = () => {
  const nodes = document.querySelectorAll(".slides");
  const parent = document.querySelector(`.${gameModeInGameSlides}`);
  parent?.insertBefore(nodes[0], nodes[2]);
  parent?.insertBefore(nodes[2], nodes[0]);
};

const GameModeInGame = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className={gameModeInGame}>
        <div className="left-arrow" onClick={async () => changeToLeft()}>
          <FaChevronLeft size={25} />
        </div>
        <div className={gameModeInGameSlides}>
          <div className="slides" id="slideTournament">
            <div className="text-button">
              <h3 className="">TOURNAMENT</h3>
              <p className="">the tournament challenge</p>
              <button className="" onClick={() => navigate("/tournament")}>
                PLAY NOW
              </button>
            </div>
            <div className="game-mode-image">
              <img src={tournament} alt="tournament image" className="" />
            </div>
          </div>
          <div className="slides" id="slideAiMode">
            <div className="text-button">
              <h3 className="">Rocket League</h3>
              <p className="">the second game challenge</p>
              <button className="" onClick={() => navigate("/rocket-league")}>
                PLAY NOW
              </button>
            </div>
            <div className="game-mode-image">
              <img src={robot} alt="robot image" className="" />
            </div>
          </div>
          <div className="slides" id="slideFriends">
            <div className="text-button">
              <h3 className="">FRIENDS</h3>
              <p className="">the friends challenge</p>
              <button className="" onClick={() => navigate("/profile/friends")}>
                PLAY NOW
              </button>
            </div>
            <div className="game-mode-image">
              <img src={friends} alt="friends images" className="" />
            </div>
          </div>
        </div>
        <div className="right-arrow" onClick={async () => changeToRight()}>
          <FaChevronRight size={25} />
        </div>
      </div>
    </>
  );
};

export default GameModeInGame;
