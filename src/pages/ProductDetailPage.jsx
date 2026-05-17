import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, cartApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const result = await productApi.getVariants(id);
        setProduct(result.data);
        if (result.data.productPhotos?.length > 0) {
          const main = result.data.productPhotos.find((p) => p.is_main) || result.data.productPhotos[0];
          setMainImage(main.url);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && selectedColor && selectedSize) {
      const variant = product.productVariants?.find(
        (v) => v.color.id === selectedColor.id && v.size.id === selectedSize.id
      );
      setSelectedVariant(variant || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedSize, product]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedVariant) return;
    setAddingToCart(true);
    setMessage('');
    try {
      await cartApi.add({ product_variant_id: selectedVariant.id, quantity: 1 });
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;
  }

  if (!product) {
    return <div className="loading-screen"><p>Product not found.</p></div>;
  }

  const colors = [];
  const sizes = [];
  const colorMap = {};
  const sizeMap = {};

  product.productVariants?.forEach((v) => {
    if (!colorMap[v.color.id]) {
      colorMap[v.color.id] = v.color;
      colors.push(v.color);
    }
    if (!sizeMap[v.size.id]) {
      sizeMap[v.size.id] = v.size;
      sizes.push(v.size);
    }
  });

  const photos = product.productPhotos || [];

  return (
    <div className="pdp-page">
      <div className="container">
        <div className="pdp-layout">
          {/* Image gallery */}
          <div className="pdp-gallery">
            <div className="pdp-main-image" style={{ backgroundColor: '#f0f0f0' }}>
              {mainImage ? (
                <img src={mainImage} alt={product.name} />
              ) : (
                <div className="pdp-no-image">NO IMAGE</div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="pdp-thumbnails">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    className={`pdp-thumb ${mainImage === photo.url ? 'active' : ''}`}
                    onClick={() => setMainImage(photo.url)}
                  >
                    <img src={photo.url} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="pdp-info">
            <p className="text-label-sm text-muted">{product.category?.name} • {product.gender}</p>
            <h1 className="pdp-title">{product.name}</h1>

            {selectedVariant && (
              <p className="pdp-price">
                Rp {selectedVariant.price?.toLocaleString('id-ID')}
              </p>
            )}

            <p className="pdp-description">{product.description}</p>

            {/* Color selector */}
            {colors.length > 0 && (
              <div className="pdp-option">
                <h3 className="text-label-bold">COLOR</h3>
                <div className="option-buttons">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      className={`option-btn ${selectedColor?.id === color.id ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="pdp-option">
                <h3 className="text-label-bold">SIZE</h3>
                <div className="option-buttons">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      className={`option-btn ${selectedSize?.id === size.id ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedVariant && (
              <p className="pdp-stock text-label-sm">
                {selectedVariant.stock > 0
                  ? `${selectedVariant.stock} in stock`
                  : 'OUT OF STOCK'}
              </p>
            )}

            {message && (
              <div className={`auth-error ${message.includes('Added') ? 'pdp-success' : ''}`}>
                {message}
              </div>
            )}

            <button
              className="btn btn-primary btn-full btn-lg mt-6"
              disabled={!selectedVariant || selectedVariant.stock === 0 || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? <span className="spinner"></span> : 'ADD TO CART'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
