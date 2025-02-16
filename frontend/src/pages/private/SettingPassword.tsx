import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { settingPassword } from "./styles";
import TwoFactorAuthentication from "@privateComponents/settings/TwoFactorAuthentication";
import {
  toggleCurrentPasswordEye,
  toggleNewPasswordEye,
  toggleRepeatPasswordEye,
} from "../modules/togglePasswordEye";
import {
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { axiosPrivate } from "@/src/services/api/axios";

const updatePasswordSchema = z
  .object({
    old_password: z
      .string()
      .min(8, { message: " not valid password" })
      .optional(),
    password: z
      .string()
      .min(8, { message: " new password should be at least 8 chars" })
      .max(20, { message: " new password be less then 20 chars" })
      .refine((str) => /[A-Z]/.test(str), {
        message: "please add an uppercase letter",
      })
      .refine((str) => /[a-z]/.test(str), {
        message: "please add a lowercase letter",
      })
      .refine((str) => /[0-9]/.test(str), {
        message: "please add a number character",
      })
      .refine((str) => /^([\x21-\x7E]){8,20}$/.test(str), {
        message: "please no spaces or special characters allowed",
      })
      .optional(),
    password1: z.string().optional(),
  })
  .refine(
    (data) => {
      return data.password === data.password1;
    },
    { message: " password don't match", path: ["password1"] }
  );

type UpdatePasswordSchemaType = z.infer<typeof updatePasswordSchema>;

const SettingPassword = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordSchemaType>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit: SubmitHandler<UpdatePasswordSchemaType> = async (
    data: UpdatePasswordSchemaType
  ) => {
    try {
      await axiosPrivate.post("pass", data);
      reset({ old_password: "", password: "", password1: "" });
    } catch (err) {
    }
  };
  return (
    <div className={settingPassword}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="current-password-container">
          <div className="current-password">
            <label htmlFor="current-password">Current password</label>
            <span className="current-password-span">
              <input
                autoComplete="on"
                type="password"
                id="current-password"
                placeholder="************"
                {...register("old_password", { required: true })}
              />
              <IoMdEyeOff
                color="white"
                size={20}
                id="toggleCurrentPasswordEyeOff"
                className="current-password-eye"
                onClick={toggleCurrentPasswordEye}
              />
              <IoMdEye
                color="white"
                size={20}
                id="toggleCurrentPasswordEyeOn"
                className="new-password-eye d-none"
                onClick={toggleCurrentPasswordEye}
              />
            </span>
            {errors.old_password && (
              <span className="error-message">
                {errors.old_password.message}
              </span>
            )}
          </div>
        </div>
        <div className="new-password-container">
          <div className="new-password">
            <label htmlFor="new-password">New password</label>
            <span className="new-password-span">
              <input
                autoComplete="on"
                type="password"
                id="new-password"
                placeholder="***********"
                {...register("password", { required: true })}
              />
              <IoMdEyeOff
                color="white"
                size={20}
                id="toggleNewPasswordEyeOff"
                className="new-password-eye"
                onClick={toggleNewPasswordEye}
              />
              <IoMdEye
                color="white"
                size={20}
                id="toggleNewPasswordEyeOn"
                className="new-password-eye d-none"
                onClick={toggleNewPasswordEye}
              />
            </span>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>
          <div className="passwordHelper">
            Your password must be 8-20 characters long, contain letters and
            numbers, and must not contain spaces, or emoji.
          </div>
        </div>
        <div className="repeat-password-container">
          <div className="repeat-password">
            <label htmlFor="repeat-password">Repeat password</label>
            <span className="repeat-password-span">
              <input
                autoComplete="on"
                type="password"
                id="repeat-password"
                placeholder="***********"
                {...register("password1", { required: true })}
              />
              <IoMdEyeOff
                color="white"
                size={20}
                id="toggleRepeatPasswordEyeOff"
                className="repeat-password-eye"
                onClick={toggleRepeatPasswordEye}
              />
              <IoMdEye
                color="white"
                size={20}
                id="toggleRepeatPasswordEyeOn"
                className="repeat-password-eye d-none"
                onClick={toggleRepeatPasswordEye}
              />
            </span>
            {errors.password1 && (
              <span className="error-message">{errors.password1.message}</span>
            )}
          </div>
        </div>
        <div className="submit-button-container">
          <div className="submit-button">
            <input
              autoComplete="on"
              type="submit"
              value="Update"
              placeholder="username..."
            />
          </div>
        </div>
        <div className="enable2F-container">
          <TwoFactorAuthentication />
        </div>
      </form>
    </div>
  );
};

export default SettingPassword;
