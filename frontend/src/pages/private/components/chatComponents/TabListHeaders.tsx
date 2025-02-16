import { memo } from "react";
import { chatTabListHeader } from "../../styles";
import { Link } from "react-router-dom";

const TabListHeaders = () => {
    return (
      <>
        <ul className={`nav nav-tabs forActiveLink ${chatTabListHeader}`} role="tablist">
            <li className="nav-item" role="presentation" id="chats">
              <Link
                className="active"
                id="all-msgs"
                data-bs-toggle="tab"
                to="#all-msgs-content"
                role="tab"
                aria-controls="all-msgs-content"
                aria-selected="true"
              >
                All Chats
              </Link>
            </li>
            <li className="nav-item" role="presentation" id="unreadChats">
              <Link
                className=""
                id="unread-msgs"
                data-bs-toggle="tab"
                to="#unread-msgs-content"
                role="tab"
                aria-controls="unread-msgs-content"
                aria-selected="false"
              >
                friends
              </Link>
            </li>
          </ul>
      </>
    );
  };

  export default memo(TabListHeaders);