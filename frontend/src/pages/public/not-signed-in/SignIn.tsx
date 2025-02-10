import axios from "@/src/services/api/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInAnimation,
  signIn,
  signInStick,
  signInRenderAnimation,
  signInBare,
} from "@publicPagesStyles/index.ts";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { BiSolidLeftArrow } from "react-icons/bi";
import { Si42 } from "react-icons/si";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import ModalOtp from "@publicPages/not-signed-in/ModalOtp";
import setAuthenticationData from "@pages/modules/setAuthenticationData";
import ModalComponent from "../../../router/layouts/components/ModalComponent";
import Modal from "react-modal";
import { authenticateWithThirdParty } from "../../modules/authenticateWithThirdParty";

const signInSchema = z.object({
  email: z
    .string({ message: "email is required" })
    .max(50, { message: "max email length is 50 chars" })
    .email({ message: "Enter valid email" }),
  password: z
    .string({ message: "password is required" })
    .min(8, { message: "password must be more than 8 chars" })
    .max(30, { message: "password must be less than 30 chars" }),
});

type SignInSchemaType = z.infer<typeof signInSchema>;

const customStyles: Modal.Styles | undefined = {
  content: {
    padding: "0px",
    top: "0px",
    left: "0px",
  },
  overlay: {
    margin: "0px",
    padding: "0px",
    maxHeight: "100%",
    maxWidth: "100%",
  },
};
const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchemaType>({ resolver: zodResolver(signInSchema) });
  useEffect(() => {}, []);
  const startAnimationSignIn = (): void => {
    const animation = document.querySelector(".animationSelectorSignIn");
    animation?.classList.remove(signInRenderAnimation);
    animation?.classList.add(signInAnimation);
    setTimeout(() => {
      navigate("/sign-up");
    }, 700);
  };
  const [errorMsg, setErrorMsg] = useState("");
  const [emailForOtp, setEmailForOtp] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const lastLocation = location.state?.from?.pathname || "/game";
  const onSubmit: SubmitHandler<SignInSchemaType> = async (
    data: SignInSchemaType
  ) => {
    try {
      const res = await axios.post("login", data);
      if (res.data) {
        if (res.data["2fa"] === true) {
          setEmailForOtp(res?.data["email"]);
          setIsOpen(true);
        }
        if (setAuthenticationData(res.data?.access)) {
          navigate(lastLocation, { replace: true });
        }
      } else {
        throw new AxiosError("No data provided by server");
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        const error: AxiosError = err as AxiosError;
        if (!error.response) {
          setErrorMsg("No Server Response");
        } else if (error.response?.status === 401) {
          setErrorMsg("Unauthorized");
        } else {
          setErrorMsg("Login Failed: " + err.response?.data.error);
        }
      } else {
        setErrorMsg(errorMsg);
      }
    }
  };
  return (
    <div
      className={`animationSelectorSignIn ${signInRenderAnimation} ${signIn}`}
    >
      <ModalComponent
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        className=""
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        shouldFocusAfterRender={true}
        shouldReturnFocusAfterClose={true}
        shouldCloseOnEsc={true}
        id={`modalOtp`}
      >
        <ModalOtp email={emailForOtp} setIsOpen={setIsOpen} />
      </ModalComponent>
      <div className="w-100 ">
        <div className="d-flex justify-content-center h-100">
          <form
            className="w-75 my-auto"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mb-4">
              <input
                type="text"
                className="form-control rounded-5 p-2"
                placeholder="Email...."
                autoComplete="on"
                {...register("email", { required: true })}
              />
              {errors?.email && (
                <span className="text-danger">{errors.email.message}</span>
              )}
            </div>
            <div className="mb-4 ">
              <input
                type="password"
                className="form-control rounded-5 p-2"
                placeholder="Password...."
                {...register("password", { required: true })}
                autoComplete={"off"}
              />
              {errors?.password && (
                <span className="text-danger">{errors.password.message}</span>
              )}
            </div>
            <div className="d-flex justify-content-evenly mb-4 p-2">
              <div
                className="text-decoration-none rounded-5 p-1 pe-2 pb-1 text-center"
                style={{ cursor: "pointer",background: "#8D6B92" }}
                onClick={() => authenticateWithThirdParty("42")}
              >
                <Si42 size={40} color="#000000" />
              </div>
            </div>
            <div className="signin-button">
              <button
                type="submit"
                className=""
              >
                SIGN IN
              </button>
            </div>
            {errorMsg && (
              <span className="text-danger bg-warning-subtle row m-0 ">
                {errorMsg}
              </span>
            )}
          </form>
        </div>
      </div>
      <div className={`${signInBare}`}>
        <p
          className=""
          onClick={() => startAnimationSignIn()}
        >
          SIGN
          <BiSolidLeftArrow className="m-0 me-2 my-3" size="1em" />
          UP
        </p>
      </div>
      <div className={`my-auto me-4 ${signInStick} `}></div>
    </div>
  );
};

export default SignIn;
