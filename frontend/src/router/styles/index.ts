import style from "@router/styles/RegistrationLayout.module.css";
import homeLayoutStyles from "@router/styles/HomeLayout.module.css";
import DashboardLayoutStyles from "@router/styles/DashboardLayout.module.css";
import ChatStyle from "@router/styles/ChatLayout.module.css";
import BackwardAtHistoryStyles from "@router/styles/componentsStyles/BackwardAtHistory.module.css";
import ChatProfileStyles from "@router/styles/componentsStyles/ChatProfileStyles.module.css";
import ProfileLayoutStyles from "@router/styles/ProfileLayout.module.css";
import SettingLayoutStyles from "@router/styles/SettingLayout.module.css";
import ProfileStatsStyles from "@router/styles/componentsStyles/ProfileStatsStyles.module.css";
import ProfileWaletStatsStyles from "@router/styles/componentsStyles/ProfileWaletStatsStyles.module.css";
import NotFoundLayoutStyles from "@router/styles/NotFoundLayout.module.css";
import TournamentLayoutStyles from "@router/styles/TournamentLayout.module.css";
import PingPongLayoutStyles from "@router/styles/PingPongLayout.module.css";
import RootLayoutStyles from "@router/styles/RootLayout.module.css";
import NotificationsComponentStyles from "@router/styles/componentsStyles/notificationsStyles/NotificationsComponent.module.css";

export const homeLayout = homeLayoutStyles["homeLayout"];

export const dashboardLayout = DashboardLayoutStyles["dashboardLayout"];

/**register layout styles */
export const registrationLayout = style["registrationLayout"];
export const registrationLayoutStick = style["registrationLayoutStick"];
export const registrationLayoutSignUpIn = style["registrationLayoutSignUpIn"];
export const registrationLayoutAnimation = style["registrationLayoutAnimation"];
export const registrationLayoutStickAnimation =
  style["registrationLayoutStickAnimation"];

export const backwardAtHistory = BackwardAtHistoryStyles["backwardAtHistory"];

/**chat layout styles*/
export const chatLayout = ChatStyle["chatLayout"];
export const chatProfileStyles = ChatProfileStyles["chatProfileStyles"];

/**profile layout styles */

export const profileLayout = ProfileLayoutStyles["profileLayout"];
export const profileStats = ProfileStatsStyles["profileStats"];
export const profileWaletStats = ProfileWaletStatsStyles["profileWaletStats"];

/**setting layout styles */

export const settingLayout = SettingLayoutStyles["settingLayout"];

/**setting layout styles */

export const notFoundLayout = NotFoundLayoutStyles["notFoundLayout"];

/**tournament layout styles */

export const tournamentLayout = TournamentLayoutStyles["tournamentLayout"];

/**pingpong layout styles */

export const pingPongLayout = PingPongLayoutStyles["pingPongLayout"];

/**root layout styles */

export const rootLayout = RootLayoutStyles["rootLayout"];

/** components of notifications styling */

export const notificationsComponent =
  NotificationsComponentStyles["notificationsComponent"];
