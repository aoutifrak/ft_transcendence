import axios from "@/src/services/api/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import setAuthenticationData from "@pages/modules/setAuthenticationData";
import { z } from "zod";
import { AxiosError } from "axios";
import { ChangeEvent, useState } from "react";
import { modalOtp } from "@publicPagesStyles/index";
import { autoFocusLogic } from "../../modules/autoFocusLogic";
const signInOtpSchema = z.object({
  otp1: z.string({ message: " Otp code verefication is  required" }).length(1, {
    message: "length of the verification code must be 6 numbers",
  }),
  otp2: z.string({ message: " Otp code verefication is  required" }).length(1, {
    message: "length of the verification code must be 6 numbers",
  }),
  otp3: z.string({ message: " Otp code verefication is  required" }).length(1, {
    message: "length of the verification code must be 6 numbers",
  }),
  otp4: z.string({ message: " Otp code verefication is  required" }).length(1, {
    message: "length of the verification code must be 6 numbers",
  }),
  otp5: z.string({ message: " Otp code verefication is  required" }).length(1, {
    message: "length of the verification code must be 6 numbers",
  }),
  otp6: z.string({ message: " Otp code verefication is  required" }).length(1, {
    message: "length of the verification code must be 6 numbers",
  }),
});

type SignInOtpSchemaType = z.infer<typeof signInOtpSchema>;

interface ModalOtpProps {
  email: string;
  setIsOpen: React.Dispatch<boolean>;
}

const ModalOtp = ({ email, setIsOpen }: ModalOtpProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInOtpSchemaType>({
    resolver: zodResolver(signInOtpSchema),
  });

  const [errorMsg, setErrorMsg] = useState("");
  const lastLocation = location.state?.from?.pathname || "/profile";
  const submitOtp: SubmitHandler<SignInOtpSchemaType> = async (
    otpData: SignInOtpSchemaType
  ) => {
    try {
      const otpCode =
        "" +
        otpData.otp1 +
        otpData.otp2 +
        otpData.otp3 +
        otpData.otp4 +
        otpData.otp5 +
        otpData.otp6;
      const res = await axios.post("signin2fa", {
        email: email,
        otp: otpCode,
      });
      if (setAuthenticationData(res.data?.access) && res.status === 200) {
        setIsOpen(false);
        navigate(lastLocation, { replace: true });
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        const error: AxiosError = err as AxiosError;
        if (!error.response) {
          setErrorMsg("No Server Response");
        } else if (error.response?.status === 401) {
          setErrorMsg("Unauthorized");
        } else {
          setErrorMsg("Login Failed");
        }
      } else {
        setErrorMsg(errorMsg);
      }
    }
  };
  const onError: SubmitErrorHandler<SignInOtpSchemaType> = (errors) => {
    if (errors.otp1) setErrorMsg(errors.otp1.message + " ");
    else if (errors.otp2) setErrorMsg(errors.otp2.message + " ");
    else if (errors.otp3) setErrorMsg(errors.otp3.message + " ");
    else if (errors.otp4) setErrorMsg(errors.otp4.message + " ");
    else if (errors.otp5) setErrorMsg(errors.otp5.message + " ");
    else if (errors.otp6) setErrorMsg(errors.otp6.message + " ");
  };
  return (
    <div className={modalOtp}>
      <div className="modal-body">
        <form className="" onSubmit={handleSubmit(submitOtp, onError)}>
          <div className="otp-code">
            <div className="inputs-code">
              <input
                type="text"
                maxLength={1}
                className=""
                autoFocus
                {...register("otp1", { required: true })}
                autoComplete={"off"}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  autoFocusLogic(e)
                }
              />
              <input
                type="text"
                maxLength={1}
                className=""
                {...register("otp2", { required: true })}
                autoComplete={"off"}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  autoFocusLogic(e)
                }
                disabled
              />
              <input
                type="text"
                maxLength={1}
                className=""
                {...register("otp3", { required: true })}
                autoComplete={"off"}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  autoFocusLogic(e)
                }
                disabled
              />
              <input
                type="text"
                maxLength={1}
                className=""
                {...register("otp4", { required: true })}
                autoComplete={"off"}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  autoFocusLogic(e)
                }
                disabled
              />
              <input
                type="text"
                maxLength={1}
                className=""
                {...register("otp5", { required: true })}
                autoComplete={"off"}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  autoFocusLogic(e)
                }
                disabled
              />
              <input
                type="text"
                maxLength={1}
                className=""
                {...register("otp6", { required: true })}
                autoComplete={"off"}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  autoFocusLogic(e)
                }
                disabled
              />
            </div>
            {errors && (
              <span className="text-danger">{errors.root?.message}</span>
            )}
          </div>
          <div className="submit-cancel-button">
            <input
              type="submit"
              className="submit"
              name="otpSubmit"
              value="verify"
            />
            <input
              type="button"
              className="cancel"
              value="cancel"
              onClick={() => {
                setIsOpen(false);
                navigate("/sign-in", { replace: true });
              }}
            />
          </div>
        </form>
        {errorMsg && <span className="text-danger">{errorMsg}</span>}
      </div>
    </div>
  );
};

export default ModalOtp;
