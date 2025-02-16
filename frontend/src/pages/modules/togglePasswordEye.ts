function toggleCurrentPasswordEye() {
  let currentPasswordOn = document.getElementById("toggleCurrentPasswordEyeOn");
  let currentPasswordInput = document.getElementById("current-password");
  const type =
    currentPasswordInput?.getAttribute("type") === "password"
      ? "text"
      : "password";
  currentPasswordOn?.classList.contains("d-none")
    ? currentPasswordOn.classList.remove("d-none")
    : currentPasswordOn?.classList?.add("d-none");

  let currentPasswordOff = document.getElementById(
    "toggleCurrentPasswordEyeOff"
  );
  currentPasswordOff?.classList.contains("d-none")
    ? currentPasswordOff.classList.remove("d-none")
    : currentPasswordOff?.classList?.add("d-none");
  currentPasswordInput?.setAttribute("type", type);
}
function toggleNewPasswordEye() {
  let newPasswordOn = document.getElementById("toggleNewPasswordEyeOn");
  let newPasswordInput = document.getElementById("new-password");
  let newPasswordOff = document.getElementById("toggleNewPasswordEyeOff");
  const type =
    newPasswordInput?.getAttribute("type") === "password" ? "text" : "password";
  newPasswordOn?.classList.contains("d-none")
    ? newPasswordOn.classList.remove("d-none")
    : newPasswordOn?.classList?.add("d-none");
  newPasswordOff?.classList.contains("d-none")
    ? newPasswordOff.classList.remove("d-none")
    : newPasswordOff?.classList?.add("d-none");
  newPasswordInput?.setAttribute("type", type);
}
function toggleRepeatPasswordEye() {
  let repeatPasswordOn = document.getElementById("toggleRepeatPasswordEyeOn");
  let repeatPasswordInput = document.getElementById("repeat-password");
  let repeatPasswordOff = document.getElementById("toggleRepeatPasswordEyeOff");
  const type =
    repeatPasswordInput?.getAttribute("type") === "password"
      ? "text"
      : "password";
  repeatPasswordOn?.classList.contains("d-none")
    ? repeatPasswordOn.classList.remove("d-none")
    : repeatPasswordOn?.classList?.add("d-none");
  repeatPasswordOff?.classList.contains("d-none")
    ? repeatPasswordOff.classList.remove("d-none")
    : repeatPasswordOff?.classList?.add("d-none");
  repeatPasswordInput?.setAttribute("type", type);
}

export {
  toggleCurrentPasswordEye,
  toggleNewPasswordEye,
  toggleRepeatPasswordEye,
};
