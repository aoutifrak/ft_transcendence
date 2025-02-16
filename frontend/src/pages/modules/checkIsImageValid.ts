export function checkIsImageValid() {
  let previewImage = document.getElementById(
    "selectedImage"
  ) as HTMLImageElement;
  let formInputImage = document.getElementById(
    "formInputImage"
  ) as HTMLInputElement;
  let errorsSpan = document.getElementById("image-errors") as HTMLSpanElement;
  let file = formInputImage.files;
  try {
    if (file && file[0]) {
      errorsSpan.innerText = "";
      let newImage = new Image();
      newImage.src = URL.createObjectURL(file[0]);
      newImage.onload = function () {
        let size = file[0].size / 2000000; //converting from bytes to MB
        if (size > 2 || file[0].size <= 0)
          errorsSpan.innerText = "image has more than 2MB";
        if (errorsSpan.innerText !== "") {
          formInputImage.value = "";
          previewImage.src = "";
          !previewImage.classList.contains("d-none") &&
            previewImage.classList.add("d-none");
          errorsSpan.classList.contains("d-none") &&
            errorsSpan.classList.remove("d-none");
        } else {
          previewImage.classList.contains("d-none") &&
            previewImage.classList.remove("d-none");
          !errorsSpan.classList.contains("d-none") &&
            errorsSpan.classList.add("d-none");
          previewImage.src = newImage.src;
        }
      };
    } else {
      !previewImage.classList.contains("d-none") &&
        previewImage.classList.add("d-none");
    }
  } catch (err) {}
}
