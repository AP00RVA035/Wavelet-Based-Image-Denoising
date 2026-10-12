# Wavelet-Based Image Denoising Using Discrete Wavelet Transform and Thresholding Techniques

**A Major Project Report**

**Subject:** Digital Image Processing (DIP)

**Authors:** Gudimalla Apoorva  
**Guide:** Priyanka Jaroli  
**Department:** CSE (AI&ML)  
**College:** Sir Padampat Singhania University  
**Year:** 2026  

---

## Abstract

Noise is unwanted random information that gets added to an image when it is captured, stored, or sent over a network. Noise makes an image look grainy and hides useful details. Removing this noise without blurring the important parts of the image is a common problem in Digital Image Processing.

This project presents a **web-based image denoising system** that removes noise from digital images using the **Discrete Wavelet Transform (DWT)** combined with **soft and hard thresholding**. The system also uses a colour noise reduction step to clean the colour information in the image.

The application has a simple web interface built with HTML, CSS, and JavaScript where the user uploads an image, selects a threshold type, adjusts a threshold value, and then gets the cleaned image. The actual denoising is done by a Python backend built using **Flask**, **PyWavelets**, and **OpenCV**.

The results show that the system successfully reduces noise while keeping the edges and important details of the image reasonably sharp. The system is simple, easy to use, and works directly in a web browser, which makes it useful for students and general users.

**Keywords:** Image Denoising, Wavelet Transform, DWT, Thresholding, Soft Threshold, Hard Threshold, OpenCV, Flask, Digital Image Processing.

---

## 1. Introduction

Images are one of the most important ways of sharing information. But almost every real image contains some amount of **noise**. Noise is a random change in pixel values that makes the image look rough or grainy. It comes from many sources such as:

- Low-quality cameras or sensors
- Poor lighting conditions
- High ISO settings
- Compression when saving or sending images
- Errors during transmission over a network

The goal of **image denoising** is to remove this noise and recover a clean image that is close to the original. This sounds simple, but it is actually difficult because noise and image details (like edges and textures) both look like sudden changes in pixel values. A simple blur can remove noise, but it also blurs the edges and makes the image look soft and unclear.

Traditional methods like **mean filtering** and **Gaussian filtering** smooth the whole image. They remove noise, but they also remove important details. This is where **wavelet-based methods** are useful. Wavelets can separate an image into different frequency parts, so we can clean the noisy parts and keep the important parts.

This project builds a complete working system that:
1. Takes an image from the user through a web page.
2. Breaks the image into wavelet components on the server.
3. Removes noise from the wavelet detail components using thresholding.
4. Rebuilds the clean image and sends it back to the user.

---

## 2. Problem Statement

Most simple denoising filters remove noise but also destroy the fine details and edges of an image. There is a need for a method that:
- Removes noise effectively, and
- Preserves the edges and important features of the image.

Also, many good denoising tools are difficult to install or require technical knowledge. There is a need for an **easy-to-use, browser-based tool** that any user can operate without installing heavy software.

**Problem:** How can we remove noise from an image while keeping its details intact, and make the process simple and accessible to normal users?

---

## 3. Objectives

The main objectives of this project are:

1. To study the basics of image noise and image denoising.
2. To understand the Discrete Wavelet Transform and how it separates an image into components.
3. To apply **soft thresholding** and **hard thresholding** to remove noise from wavelet coefficients.
4. To build a working web application with a friendly user interface.
5. To build a Python backend that performs the actual denoising.
6. To compare the quality of results and allow the user to control the strength of denoising.

---

## 4. Literature Review

Image denoising has been studied for many years. Some important and commonly used methods are:

- **Mean Filter and Gaussian Filter:** These are simple averaging filters. They remove noise but blur edges. They are easy but not very effective for detailed images.

- **Median Filter:** Good for removing salt-and-pepper noise, but not very good for Gaussian noise.

- **Bilateral Filter:** Removes noise while trying to preserve edges, but it is slow for large images.

- **Wavelet Transform (Donoho & Johnstone, 1994):** A very popular method. It breaks the image into frequency bands and applies a threshold to remove small coefficients (which are mostly noise). This method is known as **wavelet shrinkage**. It preserves edges much better than simple filters.

- **Non-Local Means (Buades et al., 2005):** A strong denoising method that compares patches of the image. It gives very good results but is slower than wavelet methods.

Our project combines the **strength of wavelets** (good edge preservation) with a **colour noise reduction step** (Non-Local Means) to get a clean result. This combination gives better output than using a single method alone.

---

## 5. Methodology

### 5.1 Overall Flow of the System

```
User Uploads Image (Browser)
          |
          v
Frontend sends image + settings to Flask backend (HTTP POST)
          |
          v
Backend: Read image -> Convert colour space -> Apply DWT
          |
          v
Estimate noise -> Apply threshold -> Reconstruct image (Inverse DWT)
          |
          v
Apply colour denoising -> Encode as PNG
          |
          v
Send cleaned image back to frontend
          |
          v
User sees / downloads the denoised image
```

### 5.2 Colour Space Conversion

The input image is in **BGR** colour format. It is converted to **YCrCb** colour space.

- **Y** = luminance (brightness)
- **Cr, Cb** = colour (chrominance) information

Why do we do this? Because the human eye is more sensitive to brightness than to colour. Noise mostly affects the luminance part. So we apply wavelet denoising mainly on the **Y channel** and keep the colour channels safe. Finally the image is converted back to BGR.

### 5.3 Discrete Wavelet Transform (DWT)

The luminance image is broken into components using the **Daubechies wavelet (db2)** and a decomposition level of up to **3 levels**.

The DWT produces:
- **Approximation coefficients (cA):** the low-frequency, smooth part of the image (the main picture).
- **Detail coefficients (cH, cV, cD):** horizontal, vertical, and diagonal details, which contain edges **and noise**.

We keep the approximation coefficients (the main image) unchanged and only modify the detail coefficients.

### 5.4 Noise Estimation

To decide how much to remove, we estimate the noise level from the **finest diagonal detail coefficients** using the **Median Absolute Deviation (MAD)** method:

```
sigma = median(|diagonal coefficients|) / 0.6745
```

The value `0.6745` is a standard constant used for this estimation.

### 5.5 Threshold Calculation

We use the **Universal Threshold** formula:

```
universal_threshold = sigma * sqrt(2 * ln(N))
```

Where `N` is the number of pixels. The user's slider value (1–100) is used as a **strength multiplier**:

```
effective_threshold = universal_threshold * (slider / 100)
```

This lets the user control how strong the denoising is.

### 5.6 Thresholding Techniques

Two types of thresholding are used:

**Hard Thresholding:**
- If the coefficient's absolute value is **greater than** the threshold, keep it as it is.
- Otherwise, set it to zero.
- Formula: `T(x) = x if |x| > λ, else 0`

**Soft Thresholding:**
- If the coefficient is greater than the threshold, shrink it toward zero.
- Otherwise, set it to zero.
- Formula: `T(x) = sign(x) * max(|x| - λ, 0)`

Soft thresholding gives smoother results, while hard thresholding keeps stronger edges but can create small artifacts.

### 5.7 Inverse DWT (Reconstruction)

After thresholding, the **Inverse Discrete Wavelet Transform (IDWT)** is applied to combine the modified coefficients back into a full image. This gives the denoised luminance channel.

### 5.8 Final Colour Denoising

To remove remaining colour noise, the system applies **Non-Local Means Denoising (fastNlMeansDenoisingColored)** from OpenCV. The strength of this step also depends on the user's slider value, so a higher slider gives a smoother output.

---

## 6. System Architecture

The system follows a **client-server (frontend-backend)** architecture.

```
+---------------------------+        HTTP POST         +--------------------------+
|        FRONTEND           |  (image + settings)      |        BACKEND           |
|  HTML + CSS + JavaScript  | -----------------------> |  Flask (Python)          |
|                           |                          |  PyWavelets, OpenCV      |
|  - Upload image           |   <-------------------   |  - DWT + Thresholding    |
|  - Choose threshold       |     Denoised image       |  - Colour denoising      |
|  - Preview / Download     |                          |                          |
+---------------------------+                          +--------------------------+
```

### 6.1 Frontend

The frontend is a single web page built with:
- **HTML** – page structure (upload box, settings, results, download buttons).
- **CSS** – styling, dark/light theme, responsive layout.
- **JavaScript** – event handling, sending the image to the backend, showing results.

Main features of the frontend:
- Upload JPG/JPEG/PNG images
- Choose soft or hard threshold
- Adjust threshold value with a slider (1–100)
- Preview and apply denoising
- View image information (name, format, dimensions, file size)
- Download original or denoised image
- Dark and light theme
- Reset option

### 6.2 Backend

The backend is built with:
- **Flask** – makes the web server and the `/denoise` API endpoint.
- **Flask-CORS** – allows the frontend to talk to the backend safely.
- **NumPy** – handles image data as arrays.
- **OpenCV (cv2)** – reads, converts, and writes images.
- **PyWavelets (pywt)** – performs the wavelet transform and thresholding.

**Main API Endpoint: `/denoise`**

| Input          | Type            | Description                          |
|----------------|-----------------|--------------------------------------|
| image          | File            | The uploaded JPG/PNG image           |
| threshold_type | String          | "soft" or "hard"                     |
| threshold      | Number (1–100)  | Strength of denoising                |

| Output     | Description                                  |
|------------|----------------------------------------------|
| PNG image  | The denoised image sent back to the browser  |

The backend checks the inputs, applies wavelet denoising, and returns the cleaned image. If something goes wrong, it returns an error message that the frontend shows to the user.

---

## 7. Tools and Technologies Used

| Component        | Technology                          |
|------------------|-------------------------------------|
| Frontend         | HTML5, CSS3, JavaScript (ES6)       |
| Backend          | Python 3, Flask, Flask-CORS         |
| Image Processing | OpenCV, NumPy, PyWavelets           |
| Wavelet          | Daubechies db2                      |
| Thresholding     | Soft & Hard thresholding            |
| Interface        | Web browser (Chrome, Edge, Firefox) |

---

## 8. Working of the Application (Step by Step)

1. The user opens the web page in a browser.
2. The user clicks **"Choose File"** and selects an image.
3. The image is displayed in the "Original Image" panel, and its details are shown.
4. The user selects the **threshold type** (Soft or Hard).
5. The user adjusts the **threshold slider** to control denoising strength.
6. The user clicks **"Preview Changes"** or **"Denoise Image"**.
7. The frontend sends the image and settings to the Flask backend.
8. The backend:
   - Reads and validates the image,
   - Converts it to YCrCb,
   - Applies DWT,
   - Estimates noise and applies thresholding,
   - Reconstructs the image with IDWT,
   - Applies colour noise reduction,
   - Encodes the result as PNG and sends it back.
9. The denoised image is shown in the "Denoised Image" panel.
10. The user can **download** the original or the denoised image.

---

## 9. Results and Discussion

The system was tested using images with different levels of noise.

**Observations:**

- **Soft thresholding** gave smoother results with fewer sharp artifacts. It is better for images with fine details like portraits or nature photos.
- **Hard thresholding** kept edges sharper, but sometimes created small "blocky" artifacts, especially at high threshold values.
- **Low threshold values** kept more detail but removed less noise.
- **High threshold values** removed more noise but could make the image look too smooth.
- The **colour denoising step** significantly reduced the colour "grain" and made the output cleaner.
- Working in the **YCrCb colour space** helped preserve the natural colours of the image.

Overall, the system successfully reduced noise while keeping the main content and edges of the image visible. The combination of wavelet thresholding and colour denoising produced clearly better results than a simple blur filter would.

---

## 10. Advantages of the Proposed System

1. **Edge preservation:** Wavelets keep important details better than simple filters.
2. **User control:** The slider lets the user decide how much denoising to apply.
3. **Two methods:** Both soft and hard thresholding are available.
4. **Easy to use:** Works directly in a web browser, no installation needed for the user.
5. **Colour handling:** Special care is taken to keep colours natural.
6. **Platform independent:** Runs on any device with a modern browser.

---

## 11. Limitations

1. The quality of the result depends on the chosen threshold value, which the user sets manually.
2. Very high noise levels are difficult to remove completely.
3. The Non-Local Means step makes the process slower for very large images.
4. The system needs the Python backend to be running; it is not fully offline in the browser.

---

## 12. Future Scope

1. **Automatic threshold selection** using BayesShrink or SureShrink methods.
2. Support for **grayscale, medical, and satellite images**.
3. Adding **more wavelet families** (db4, sym4, coiflet) for comparison.
4. Adding **quality metrics** like PSNR and SSIM to measure results automatically.
5. Deploying the backend to the **cloud** so it can be used by anyone online.
6. Adding **batch processing** to clean many images at once.
7. Using **deep learning (CNN) denoising** for even better results.

---

## 13. Conclusion

This project successfully built a **wavelet-based image denoising system** using the Discrete Wavelet Transform and thresholding techniques. The system removes noise from images while preserving edges and important details much better than simple smoothing filters.

By breaking the image into wavelet components and applying soft or hard thresholding, the system is able to separate noise from real image information. The extra colour denoising step improves the final quality further.

The project also shows how image processing can be made **simple and accessible** through a web application. Users need no technical knowledge to use it—they simply upload an image, adjust a slider, and download the clean result. This makes the system useful for students, photographers, and anyone who works with digital images.

In conclusion, the combination of **wavelet transforms, thresholding, and a friendly web interface** provides an effective, practical, and easy-to-use solution for image denoising.

---

## 14. References

1. D. L. Donoho and I. M. Johnstone, *"Ideal spatial adaptation by wavelet shrinkage,"* Biometrika, vol. 81, no. 3, pp. 425–455, 1994.

2. S. Mallat, *"A theory for multiresolution signal decomposition: the wavelet representation,"* IEEE Transactions on Pattern Analysis and Machine Intelligence, vol. 11, no. 7, pp. 674–693, 1989.

3. A. Buades, B. Coll, and J.-M. Morel, *"A non-local algorithm for image denoising,"* IEEE Computer Society Conference on Computer Vision and Pattern Recognition (CVPR), 2005.

4. R. C. Gonzalez and R. E. Woods, *Digital Image Processing*, 4th ed., Pearson, 2018.

5. G. Strang and T. Nguyen, *Wavelets and Filter Banks*, Wellesley-Cambridge Press, 1996.

6. OpenCV Documentation, *"Image Denoising,"* https://docs.opencv.org

7. PyWavelets Documentation, *"Wavelet Transforms in Python,"* https://pywavelets.readthedocs.io

8. Flask Documentation, *"Flask Web Framework,"* https://flask.palletsprojects.com

---

*End of Report*
