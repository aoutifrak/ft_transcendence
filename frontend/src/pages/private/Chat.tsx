import { SlEmotsmile } from "react-icons/sl";
import { chat } from "./styles";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { visibilityProfileIcon } from "@/media-exporting";
import { GiConversation } from "react-icons/gi";
const Chat = () => {
return (
  <>
    <div className={`${chat}`}>
      <div id="chatAreaHeader">
        <div
          className="d-flex align-items-center ms-auto py-2 "
        >
          <svg
            width="1.5em"
            height="1.5em"
            className="profileVisibility bg-secondary bg-opacity-50"
            style={{cursor:"no-drop"}}
          >
            <image
              x="0"
              y="0"
              width="100%"
              height="100%"
              href={visibilityProfileIcon}
            />
          </svg>
        </div>
      </div>
      <div className="chatContent">
        <div className="messagesArea">
          <div className="default-chat-icon">
              <GiConversation color="white" size="80%" className=""/>
          </div>
        </div>
        <form
          className="sendMessageField invisible"
          style={{ pointerEvents:"none"}}
        >
          <span className="">
            <SlEmotsmile size={30} />
          </span>
          <input
            type="text"
            placeholder="Type..."
            name="textMessage"
            className=""
          />
          <span className="" >
            <IoArrowForwardCircleOutline size={30} />
          </span>
        </form>
      </div>
    </div>
  </>
);
};

export default Chat;
