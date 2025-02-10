import GameStyles from "./Game.module.css";
import SidebarStyles from "./Sidebar.module.css";
import BgCircleStyles from "./GameBackgroundCircle.module.css";
import ModeStyles from "./GameModeInGame.module.css";
import SearchFriendsStyles from "./GameSearchFriendsInGame.module.css";
import pongPlayerStyles from "./PongPlayerInGame.module.css";
import LeaderBoardStyles from "./GameLeaderBoardInGame.module.css";
import GameProfileStyles from "./GameProfileInGame.module.css";
import GameRecentStyles from "./GameRecentInGame.module.css";
import NotificationsInGame from "./DashboardStyling/NotificationsInGame.module.css";
import ChatStyles from "./Chat.module.css";
import UsersChatCardStyles from "./ChatUsersChatCard.module.css";
import ConversationsList from "./ChatConversationsList.module.css";
import TabListHeader from "./ChatTabListHeaders.module.css";
import ConversationContent from "./ChatConversationContent.module.css";
import ProfileStyles from "./Profile.module.css";
import RecentStyles from "./Recent.module.css";
import FriendsStyles from "./Friends.module.css";
import FriendRequestsStyles from "./FriendRequests.module.css";
import SettingProfileStyles from "./SettingProfile.module.css";
import SettingPasswordStyles from "./SettingPassword.module.css";
import SettingTwoFactorAuthentificationStyles from "./SettingTwoFactorAuthentification.module.css";

/**
 * the styles of sidebar components
 */

export const sidebar = SidebarStyles["sidebar"];

/**
 * the styles of dashboard (game) components
 */
export const game = GameStyles["game"];
export const gameBackgroundCircle = BgCircleStyles["gameBackgroundCircle"];

export const gameModeInGame = ModeStyles["gameModeInGame"];
export const gameModeInGameSlides = ModeStyles["gameModeInGameSlides"];

export const searchFriendsInGame = SearchFriendsStyles["searchFriendsInGame"];
export const pongPlayerInGame = pongPlayerStyles["pongPlayerInGame"];
export const gameLeaderBoardInGame = LeaderBoardStyles["gameLeaderBoardInGame"];
export const gameProfileInGame = GameProfileStyles["gameProfileInGame"];
export const gameRecentInGame = GameRecentStyles["gameRecentInGame"];
export const notificationsInGame = NotificationsInGame["notificationsInGame"];
export const gameRecentInGameImageAndName =
  GameRecentStyles["gameRecentInGameImageAndName"];

/**
 * the styles of chat components
 */

export const chat = ChatStyles["chat"];
export const chatUsersChatCard = UsersChatCardStyles["chatUsersChatCard"];
export const chatConversationsList = ConversationsList["chatConversationsList"];
export const chatTabListHeader = TabListHeader["chatTabListHeader"];
export const chatConversationContent =
  ConversationContent["chatConversationContent"];

/**
 * the styles of profile components
 */

export const profile = ProfileStyles["profile"];
export const recent = RecentStyles["recent"];
export const friends = FriendsStyles["friends"];
export const friendRequests = FriendRequestsStyles["friendRequests"];

/**
 * the styles of setting components
 */

export const settingProfile = SettingProfileStyles["settingProfile"];
export const settingPassword = SettingPasswordStyles["settingPassword"];
export const twoFactorAuthentification = SettingTwoFactorAuthentificationStyles["twoFactorAuthentification"];
