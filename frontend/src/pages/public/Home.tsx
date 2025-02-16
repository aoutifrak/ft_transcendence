import { Fragment } from "react/jsx-runtime";
import { home } from "@publicPagesStyles/index";
import { ImFilm } from "react-icons/im";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/src/states/store";
import logOut from "../modules/logOut";

const Home = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.authenticator.value
  );
  return (
    <Fragment>
      <main className={`${home}`}>
        <div className="pingPongVector"></div>
        <section className="section-header-paragraph-ping-animation">
          <div className="header-paragraph">
            <div className="header-text">
              BEST
              <br />
              <span className="">
                <span className="ping"> PING</span>
                <span className="pong">PONG </span>
              </span>{" "}
              <br />
              PLAYING TODAY
            </div>
            <div className="paragraph-text">
              We captivate a multitude of users with our game. Our unwavering
              mission is to spread the thrill and excitement of ping pong to
              every corner of the world.
            </div>
          </div>
          <div className="ping-animation">
            <div className="ping-table">
              <div className="half-field"></div>
              <div className="left-bar"></div>
              <div className="ping-ball"></div>
              <div className="right-bar"></div>
            </div>
          </div>
        </section>
        <section className="section-video-sign-in-links">
          <div className="video-sign-in-links">
            <span className="">
              <ImFilm />
              <Link to="#" className="video-link">
                WATCH VIDEO
              </Link>
            </span>
            {isAuthenticated ? (
              <Link to="#logout" className="sign-in-link" onClick={logOut}>
                LOG OUT
              </Link>
            ) : (
              <Link to="/sign-in" className="sign-in-link">
                SIGN IN
              </Link>
            )}
          </div>
          <div className="underline"></div>
        </section>
      </main>
    </Fragment>
  );
};

export default Home;
