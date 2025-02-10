import { ChangeEvent } from "react";

const isInputHasAttribute = (
  inputField: HTMLInputElement,
  attributName: string
): boolean => {
  return inputField.hasAttribute(attributName);
};

const autoFocusLogic = (e: ChangeEvent<HTMLInputElement>) => {
  const inputs = document.getElementsByTagName("input");
  let i;
  let nextInput: HTMLInputElement;

  i = Number(e.target.getAttribute("name")?.charAt(3));
  nextInput = (
    i === 6 ? inputs.namedItem("otpSubmit") : inputs.namedItem("otp" + (i + 1))
  ) as HTMLInputElement;
  if (e.target.value) {
    e.target.blur();
    if (isInputHasAttribute(nextInput, "disabled"))
      nextInput.attributes.removeNamedItem("disabled");
    nextInput?.focus();
  }
};
// export autoFocusLogic;

export {autoFocusLogic}