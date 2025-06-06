import React, { useState } from "react";
import PropTypes from "prop-types"; // ✅ Importar PropTypes

function ImageGallery({ images = [] }) {
    const [selectedImage, setSelectedImage] = useState(images[0] || "");

    return (
        <div className="image-gallery">
            {selectedImage && (
                <img src={selectedImage} alt="Producto" className="main-image" />
            )}

            <div className="thumbnails">
                {images.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`Thumbnail ${index}`}
                        className={`thumbnail ${selectedImage === img ? "active" : ""}`}
                        onClick={() => setSelectedImage(img)}
                    />
                ))}
            </div>
        </div>
    );
}


ImageGallery.propTypes = {
    images: PropTypes.arrayOf(PropTypes.string).isRequired, // Lista de strings obligatoria
};

export default ImageGallery;
