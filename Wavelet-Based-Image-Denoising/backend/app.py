from flask import Flask, request, send_file, jsonify
from flask_cors import CORS

import cv2
import numpy as np
import pywt
import io

app = Flask(__name__)
CORS(app)


def read_uploaded_image(file):
    """Read the uploaded image."""

    if file is None:
        raise ValueError("Please upload an image first.")

    image_bytes = file.read()
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)

    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Please upload a valid JPG or PNG image.")

    return image



def apply_wavelet_denoising(image, threshold, threshold_type):
    """
    Strong wavelet-based denoising using DWT,
    soft/hard thresholding, and edge-preserving
    colour denoising.
    """

    # Convert image to luminance and colour channels
    ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
    luminance = ycrcb[:, :, 0].astype(np.float32)

    height, width = luminance.shape
    strength = float(threshold) / 100.0

    wavelet = "db2"

    # Choose the valid wavelet decomposition level
    max_level = pywt.dwt_max_level(
        min(height, width),
        pywt.Wavelet(wavelet).dec_len
    )

    if max_level >= 1:
        level = min(3, max_level)

        # Apply Discrete Wavelet Transform
        coefficients = pywt.wavedec2(
            luminance,
            wavelet,
            level=level,
            mode="symmetric"
        )

        # Estimate noise from finest diagonal details
        diagonal = coefficients[-1][2]

        sigma = (
            np.median(np.abs(diagonal))
            / 0.6745
        )

        # Stronger threshold controlled by slider
        universal_threshold = (
            sigma
            * np.sqrt(2.0 * np.log(max(luminance.size, 2)))
        )

        effective_threshold = (
            universal_threshold * strength
        )

        # Keep approximation coefficients unchanged
        filtered_coefficients = [coefficients[0]]

        # Threshold all wavelet detail coefficients
        for details in coefficients[1:]:
            filtered_details = []

            for detail in details:
                filtered = pywt.threshold(
                    detail,
                    effective_threshold,
                    mode=threshold_type
                )

                filtered_details.append(filtered)

            filtered_coefficients.append(
                tuple(filtered_details)
            )

        # Reconstruct the image using inverse DWT
        reconstructed = pywt.waverec2(
            filtered_coefficients,
            wavelet,
            mode="symmetric"
        )

        reconstructed = reconstructed[:height, :width]

        ycrcb[:, :, 0] = np.clip(
            reconstructed, 0, 255
        ).astype(np.uint8)

        wavelet_result = cv2.cvtColor(
            ycrcb,
            cv2.COLOR_YCrCb2BGR
        )

    else:
        wavelet_result = image.copy()

    # Final colour noise reduction
    # Higher slider values produce stronger smoothing
    h = 3.0 + 0.22 * float(threshold)

    denoised_image = cv2.fastNlMeansDenoisingColored(
        wavelet_result,
        None,
        h,
        h,
        7,
        21
    )

    return denoised_image
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Wavelet Image Denoising Backend is running"
    })


@app.route("/denoise", methods=["POST"])
def denoise():
    try:
        # Receive the image and settings from JavaScript
        uploaded_file = request.files.get("image")

        threshold_type = request.form.get(
            "threshold_type",
            "soft"
        ).lower()

        threshold = float(
            request.form.get("threshold", "20")
        )

        # Validate threshold type
        if threshold_type not in ("soft", "hard"):
            raise ValueError(
                "Choose Soft Threshold or Hard Threshold."
            )

        # Validate threshold value
        if not 1 <= threshold <= 100:
            raise ValueError(
                "Threshold must be between 1 and 100."
            )

        # Read and denoise the image
        image = read_uploaded_image(uploaded_file)

        result = apply_wavelet_denoising(
            image,
            threshold,
            threshold_type
        )

        # Convert the result into a PNG image
        success, encoded_image = cv2.imencode(
            ".png",
            result
        )

        if not success:
            raise ValueError("Could not create the output image.")

        output = io.BytesIO(encoded_image.tobytes())
        output.seek(0)

        # Send the result back to the existing frontend
        return send_file(
            output,
            mimetype="image/png",
            download_name="denoised-image.png"
        )

    except (ValueError, TypeError) as error:
        return jsonify({
            "error": str(error)
        }), 400

    except Exception:
        app.logger.exception("Image denoising failed")

        return jsonify({
            "error": "Image processing failed. Check the terminal."
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )