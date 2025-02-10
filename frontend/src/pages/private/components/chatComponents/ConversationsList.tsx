import { ChangeEvent, useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import UsersChatCard from "./UsersChatCard";
import { chatConversationsList } from "../../styles";
import TabListHeaders from "./TabListHeaders";
import { RootState } from "@/src/states/store";
import { useSelector } from "react-redux";
import { UserDataType } from "@/src/customDataTypes/UserDataType";
import FriendsChatCard from "./FriendsChatCard";

export type ConversationListDataType = UserDataType;

function searchFilter(
  event: ChangeEvent<HTMLInputElement>,
  conversationsListData: ConversationListDataType[],
  setConversationsList: React.Dispatch<React.SetStateAction<ConversationListDataType[]>>
) {
  event.preventDefault();
  const filteredSearchData = conversationsListData.filter((conversation) => {
    return conversation.username
      ?.toLowerCase()
      .includes(event.target.value.toLowerCase());
  });
  filteredSearchData.length < 1
    ? (event.target.style.color = "red")
    : (event.target.style.color = "white");
  filteredSearchData.length > 0 && setConversationsList(filteredSearchData);
}

const ConversationsList = () => {
  const conversations = useSelector((state: RootState) => state.conversations.value)
  const [conversationsList, setConversationsList] = useState<
    ConversationListDataType[]
  >(conversations);
  useEffect(() => {
    setConversationsList(conversations);
  }, [conversations]);
  return (
    <>
      <div className={`${chatConversationsList}`}>
        <div className="input-groupss" id="searchInput">
          <span className="input-group-texts" id="basic-addon1">
            <BiSearch />
          </span>
          <input
            type="text"
            name="search"
            className="form-controlss"
            placeholder="Search......."
            onChange={(event) =>
              searchFilter(event, conversations, setConversationsList)
            }
            aria-describedby="basic-addon1"
          />
        </div>
        <div className="message">Message</div>
        <TabListHeaders />
        <div className="tab-content mt-3" id="tab-content">
            <UsersChatCard conversations={conversationsList}/>
            <FriendsChatCard />
        </div>
      </div>
    </>
  );
};

export default ConversationsList;
