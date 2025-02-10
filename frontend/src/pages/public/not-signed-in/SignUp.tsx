import axios from "@/src/services/api/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signUpAnimation,
  signUpRenderAnimation,
  signUp,
  signUpStick,
  signUpBare,
} from "@publicPagesStyles/";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { BiSolidRightArrow } from "react-icons/bi";
import { Si42 } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { authenticateWithThirdParty } from "../../modules/authenticateWithThirdParty";

const signUpSchema = z.object({
  email: z
    .string({ message: "email is required" })
    .max(50, { message: "max email length is 50 chars" })
    .email({ message: "Enter valid email" }),
  username: z
    .string({ message: "username is required" })
    .min(4, { message: "username length must be more than 4 chars" })
    .max(20, { message: "username length is less than 20 chars" }),
  first_name: z
    .string({ message: "first name is required" })
    .min(4, { message: "first name length must be more than 4 chars" })
    .max(25, { message: "first name length is less than 25 chars" }),
  last_name: z
    .string({ message: "last name is required" })
    .min(4, { message: "last name length must be more than 4 chars" })
    .max(25, { message: "last name length is less than 25 chars" }),
  password: z
    .string({ message: "password is required" })
    .min(8, { message: "password must be more than 8 chars" })
    .max(30, { message: "password must be less than 30 chars" }),
});

type SignUpSchemaType = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchemaType>({ resolver: zodResolver(signUpSchema) });
  useEffect(() => {}, []);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const onSubmit: SubmitHandler<SignUpSchemaType> = async (
    data: SignUpSchemaType
  ) => {
    try {
      await axios.post("signup", JSON.stringify(data));
      navigate("/sign-in", { replace: true });
    } catch (err) {
      if (err instanceof AxiosError) {
        const error: AxiosError = err as AxiosError;
        if (!error.response) {
          setErrorMsg("No Server Response");
        } else if (error.response?.status === 401) {
          setErrorMsg("Unauthorized");
        } else {
          setErrorMsg("SignUp Failed: " + err.response?.data);
        }
      } else {
        setErrorMsg(errorMsg);
      }
    }
  };
  const startAnimationSignUp = (): void => {
    const animation = document.querySelector(".animationSelectorSignUp");
    animation?.classList.remove(signUpRenderAnimation);
    animation?.classList.add(signUpAnimation);
    setTimeout(() => {
      navigate("/sign-in");
    }, 700);
  };
  return (
    <div
      className={`animationSelectorSignUp ${signUpRenderAnimation} ${signUp}`}
    >
      <div className="w-100 ">
        <div className="d-flex justify-content-center h-100">
          <form className="w-75 my-auto" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4 d-flex flex-wrap">
              <div className="col-6">
                <input
                  type="text"
                  className="form-control rounded-5 p-2"
                  placeholder="first name ...."
                  {...register("first_name", { required: true })}
                  autoComplete={"off"}
                />
              </div>
              <div className="col-6">
                <input
                  type="text"
                  className="form-control rounded-5 p-2"
                  placeholder="last-name..."
                  {...register("last_name", { required: true })}
                  autoComplete={"off"}
                />
              </div>
              {errors?.last_name && (
                <span className="text-danger">{errors.last_name.message}</span>
              )}
              {errors?.first_name && (
                <span className="text-danger">{errors.first_name.message}</span>
              )}
            </div>
            <div className="mb-4">
              <input
                type="text"
                className="form-control rounded-5 p-2"
                placeholder="Email...."
                {...register("email", { required: true })}
                autoComplete={"off"}
              />
              {errors?.email && (
                <span className="text-danger">{errors.email.message}</span>
              )}
            </div>
            <div className="mb-4">
              <input
                type="text"
                className="form-control rounded-5 p-2"
                placeholder="username...."
                {...register("username", { required: true })}
                autoComplete={"off"}
              />
              {errors?.username && (
                <span className="text-danger">{errors.username.message}</span>
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
                style={{ cursor: "pointer", background: "#8D6B92" }}
                onClick={() => authenticateWithThirdParty("42")}
              >
                <Si42 size={40} color="#000000" />
              </div>
            </div>
            <div className="signup-button">
              <button
                type="submit"
                className="rounded-5 px-5 py-1 h4 m-0 text-nowrap"
              >
                SIGN UP
              </button>
            </div>
            {errorMsg ? <span className="text-danger"> {errorMsg} </span> : ""}
          </form>
        </div>
      </div>
      <div className={`border d-flex my-auto mx-3 me-5 p-0  ${signUpBare}`}>
        <p
          className="text-center h4 m-1"
          onClick={() => startAnimationSignUp()}
        >
          SIGN
          <BiSolidRightArrow className="m-0 me-0 my-3" size="1em" />
          IN
        </p>
      </div>
      <div className={`my-auto ms-4 ${signUpStick} `}></div>
    </div>
  );
};

export default SignUp;
