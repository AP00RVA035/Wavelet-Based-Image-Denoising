const imageInput = document.getElementById("imageInput");
const chooseImage = document.getElementById("chooseImage");
const removeImage = document.getElementById("removeImage");

const originalImage = document.getElementById("originalImage");
const denoisedImage = document.getElementById("denoisedImage");

const originalPlaceholder =
    document.getElementById("originalPlaceholder");

const denoisedPlaceholder =
    document.getElementById("denoisedPlaceholder");

const fileName =
    document.getElementById("fileName");

const threshold =
    document.getElementById("threshold");

const thresholdValue =
    document.getElementById("thresholdValue");

const thresholdType =
    document.getElementById("thresholdType");

const denoiseButton =
    document.getElementById("denoiseButton");

const previewButton =
    document.getElementById("previewButton");

const statusText =
    document.getElementById("statusText");

const resetAll =
    document.getElementById("resetAll");

const themeSelect =
    document.getElementById("themeSelect");

const downloadOriginal =
    document.getElementById("downloadOriginal");

const downloadDenoised =
    document.getElementById("downloadDenoised");

const imageInfoBtn =
    document.getElementById("imageInfoBtn");

const infoModal =
    document.getElementById("infoModal");

const closeModal =
    document.getElementById("closeModal");


let selectedImage = null;
let originalURL = null;
let denoisedURL = null;


/* CHOOSE IMAGE */

chooseImage.addEventListener("click", function () {
    imageInput.click();
});


/* IMAGE UPLOAD */

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    selectedImage = file;

    if (originalURL) {
        URL.revokeObjectURL(originalURL);
    }

    originalURL = URL.createObjectURL(file);

    originalImage.src = originalURL;
    originalImage.style.display = "block";

    originalPlaceholder.style.display = "none";

    fileName.textContent = file.name;

    statusText.textContent = "Image loaded";

    updateImageInformation(file);
});


/* IMAGE INFORMATION */

function updateImageInformation(file) {

    const format =
        file.type.split("/")[1]?.toUpperCase() || "IMAGE";

    const size =
        (file.size / 1024).toFixed(1) + " KB";

    const image = new Image();

    image.onload = function () {

        const dimensions =
            image.width + " × " + image.height;

        document.getElementById("infoName").textContent =
            file.name;

        document.getElementById("infoFormat").textContent =
            format;

        document.getElementById("infoDimensions").textContent =
            dimensions;

        document.getElementById("infoSize").textContent =
            size;

        document.getElementById("modalName").textContent =
            file.name;

        document.getElementById("modalFormat").textContent =
            format;

        document.getElementById("modalDimensions").textContent =
            dimensions;

        document.getElementById("modalSize").textContent =
            size;
    };

    image.src = URL.createObjectURL(file);
}


/* REMOVE IMAGE */

removeImage.addEventListener("click", function () {

    imageInput.value = "";

    selectedImage = null;

    if (originalURL) {
        URL.revokeObjectURL(originalURL);
        originalURL = null;
    }

    if (denoisedURL) {
        URL.revokeObjectURL(denoisedURL);
        denoisedURL = null;
    }

    originalImage.src = "";
    denoisedImage.src = "";

    originalImage.style.display = "none";
    denoisedImage.style.display = "none";

    originalPlaceholder.style.display = "block";
    denoisedPlaceholder.style.display = "block";

    fileName.textContent = "No file selected";

    statusText.textContent = "Ready";

    document.getElementById("infoName").textContent = "-";
    document.getElementById("infoFormat").textContent = "-";
    document.getElementById("infoDimensions").textContent = "-";
    document.getElementById("infoSize").textContent = "-";
});


/* THRESHOLD SLIDER */

threshold.addEventListener("input", function () {

    thresholdValue.textContent = this.value;

    statusText.textContent = "Settings changed";

});



/* PREVIEW CHANGES */

previewButton.addEventListener("click", function () {
    if (!selectedImage) {
        alert("Please upload an image first.");
        return;
    }

    denoiseImage();
});


/* DENOISE USING PYTHON BACKEND */

denoiseButton.addEventListener("click", function () {
    denoiseImage();
});


async function denoiseImage() {
    if (!selectedImage) {
        alert("Please upload an image first.");
        return;
    }

    try {
        statusText.textContent = "Processing image...";
        denoiseButton.disabled = true;
        previewButton.disabled = true;

        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append("threshold_type", thresholdType.value.toLowerCase());
        formData.append("threshold", threshold.value);

        const response = await fetch("http://127.0.0.1:5000/denoise", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            let message = "Image processing failed.";

            try {
                const errorData = await response.json();
                message = errorData.error || message;
            } catch (_) {}

            throw new Error(message);
        }

        const blob = await response.blob();

        if (denoisedURL) {
            URL.revokeObjectURL(denoisedURL);
        }

        denoisedURL = URL.createObjectURL(blob);

        denoisedImage.src = denoisedURL;
        denoisedImage.style.display = "block";
        denoisedPlaceholder.style.display = "none";

        statusText.textContent = "Denoising completed successfully!";
    } catch (error) {
        console.error(error);
        statusText.textContent = "Denoising failed";
        alert(error.message + "\nCheck that your Python backend is running.");
    } finally {
        denoiseButton.disabled = false;
        previewButton.disabled = false;
    }
}



/* DOWNLOAD ORIGINAL */

downloadOriginal.addEventListener("click", function () {

    if (!selectedImage || !originalURL) {
        alert("Please upload an image first.");
        return;
    }

    const link = document.createElement("a");

    link.href = originalURL;
    link.download = "original-image";

    link.click();

});


/* DOWNLOAD DENOISED */

downloadDenoised.addEventListener("click", function () {

    if (!denoisedURL) {
        alert("Please denoise the image first.");
        return;
    }

    const link = document.createElement("a");

    link.href = denoisedURL;
    link.download = "denoised-image";

    link.click();

});


/* IMAGE INFORMATION MODAL */

imageInfoBtn.addEventListener("click", function () {

    if (!selectedImage) {
        alert("Please upload an image first.");
        return;
    }

    infoModal.classList.add("active");

});


closeModal.addEventListener("click", function () {

    infoModal.classList.remove("active");

});


infoModal.addEventListener("click", function (event) {

    if (event.target === infoModal) {
        infoModal.classList.remove("active");
    }

});


/* DARK / LIGHT THEME */

themeSelect.addEventListener("change", function () {

    if (this.value === "light") {

        document.body.classList.add("light");

    } else {

        document.body.classList.remove("light");

    }

});


/* RESET ALL */

resetAll.addEventListener("click", function () {

    imageInput.value = "";

    selectedImage = null;

    if (originalURL) {
        URL.revokeObjectURL(originalURL);
        originalURL = null;
    }

    if (denoisedURL) {
        URL.revokeObjectURL(denoisedURL);
        denoisedURL = null;
    }

    originalImage.src = "";
    denoisedImage.src = "";

    originalImage.style.display = "none";
    denoisedImage.style.display = "none";

    originalPlaceholder.style.display = "block";
    denoisedPlaceholder.style.display = "block";

    fileName.textContent = "No file selected";

    threshold.value = 20;
    thresholdValue.textContent = "20";

    thresholdType.value = "soft";

    statusText.textContent = "Ready";

    document.getElementById("infoName").textContent = "-";
    document.getElementById("infoFormat").textContent = "-";
    document.getElementById("infoDimensions").textContent = "-";
    document.getElementById("infoSize").textContent = "-";

});


/* ESCAPE CLOSES MODAL */

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        infoModal.classList.remove("active");
    }

});