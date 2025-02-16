import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouteObject,
  RouterProvider,
} from "react-router-dom";

// layouts
import RootLayout from "@router/layouts/RootLayout";
import HomeLayout from "@router/layouts/HomeLayout";
import DashboardLayout from "@router/layouts/DashboardLayout";
import ProfileLayout from "@router/layouts/ProfileLayout";
import SettingLayout from "@router/layouts/SettingLayout";
import RegistrationLayout from "@router/layouts/RegistrationLayout";
import ChatLayout from "@router/layouts/ChatLayout";
import TournamentLayout from "./layouts/TournamentLayout";
import NotFoundLayout from "./layouts/NotFoundLayout";

// pages
import Home from "@publicPages/Home";
import SignUp from "@publicPages/not-signed-in/SignUp";
import SignIn from "@publicPages/not-signed-in/SignIn";
import Profile from "@privatePages/Profile";
import Chat from "@privatePages/Chat";
import Game from "@privatePages/Game";
import Recent from "@privatePages/Recent";
import Friends from "@privatePages/Friends";
import SettingProfile from "../pages/private/SettingProfile";
import SettingPassword from "@/src/pages/private/SettingPassword";
import ChatArea from "@privatePages/ChatArea";
import PongMatch from "./layouts/PongMatchmaking";
// import PingPongLayout from "./layouts/PingPongLayout";
// import Pong from "./layouts/PingPongLocal";

// routers protection
import PrivateRoutes from "@router/PrivateRoutes";
import AuthorizationRoutes from "@router/AuthorizationRoutes";
import FriendRequests from "../pages/private/FriendRequests";
import PingPongLayout from "./layouts/PingPongLayout";
import Pong from "./layouts/PingPongLocal";
import Match from "./layouts/matchmaking";
import OAuth from "../pages/public/not-signed-in/OAuth";

const routingTree: RouteObject[] = createRoutesFromElements(
  <Route element={<RootLayout />} errorElement={<NotFoundLayout/>}>
    <Route path="/" element={<HomeLayout />} errorElement={<NotFoundLayout/>}>
      <Route index element={<Home />} errorElement={<NotFoundLayout/>}/>
    </Route>
    <Route element={<AuthorizationRoutes />} errorElement={<NotFoundLayout/>}>
      <Route element={<RegistrationLayout />} errorElement={<NotFoundLayout/>}>
        <Route path="oauth" element={<OAuth />} errorElement={<NotFoundLayout/>} />
        <Route path="sign-up" element={<SignUp />} errorElement={<NotFoundLayout/>}/>
        <Route path="sign-in" element={<SignIn />} errorElement={<NotFoundLayout/>}/>
      </Route>
    </Route>
    <Route element={<PrivateRoutes />} errorElement={<NotFoundLayout/>}>
      <Route element={<DashboardLayout />} errorElement={<NotFoundLayout/>}>
        <Route path="game" element={<Game />} errorElement={<NotFoundLayout/>}/>
        <Route path="profile" errorElement={<NotFoundLayout/>}>
          <Route element={<ProfileLayout />} errorElement={<NotFoundLayout/>}>
            <Route index element={<Navigate to="details" replace />} errorElement={<NotFoundLayout/>}/>
            <Route path="details" element={<Profile />} errorElement={<NotFoundLayout/>}/>
            <Route path="recent" element={<Recent />} errorElement={<NotFoundLayout/>}/>
            <Route path="friends" element={<Friends />} errorElement={<NotFoundLayout/>}/>
            <Route path="requests" element={<FriendRequests />} errorElement={<NotFoundLayout/>}/>
            <Route path=":userName">
              <Route index element={<Navigate to="details" replace />} errorElement={<NotFoundLayout/>}/>
              <Route path="details" element={<Profile />} errorElement={<NotFoundLayout/>}/>
              <Route path="recent" element={<Recent />} errorElement={<NotFoundLayout/>}/>
            </Route>
          </Route>
        </Route>
        <Route path="chat" element={<ChatLayout />} errorElement={<NotFoundLayout/>}>
          <Route index element={<Chat />} />
          <Route path=":userName" errorElement={<NotFoundLayout/>} element={<ChatArea />} />
        </Route>
        <Route path="setting" element={<SettingLayout />} errorElement={<NotFoundLayout/>}>
          <Route index element={<Navigate to="profile" replace />} errorElement={<NotFoundLayout/>}/>
          <Route path="profile" element={<SettingProfile />} errorElement={<NotFoundLayout/>}/>
          <Route path="password" element={<SettingPassword />} errorElement={<NotFoundLayout/>}/>
        </Route>
        <Route path="tournament" element={<TournamentLayout />} errorElement={<NotFoundLayout/>}></Route>
        <Route path="ponglocal" element={<Pong />} errorElement={<NotFoundLayout/>}/> 
        <Route path="pong" element={<PingPongLayout/>} errorElement={<NotFoundLayout/>}/>
        <Route path="rocket-league" element={<Match />} errorElement={<NotFoundLayout/>}/> 
        <Route path="PongMatchmaking" element={<PongMatch />} errorElement={<NotFoundLayout/>}/> 
      </Route>
    </Route>
    <Route path="*" element={<NotFoundLayout />}></Route>
  </Route>
);

const router = createBrowserRouter(routingTree, {
  future: {
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_relativeSplatPath: true,
    v7_skipActionErrorRevalidation: true,
  },
});

const MainRoutingComponent = () => {
  return (
    <RouterProvider
      future={{
        v7_startTransition: true,
      }}
      router={router}
    />
  );
};

export default MainRoutingComponent;
