import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, cartApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

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

  const handlePrevImage = () => {
    if (!product?.productPhotos || product.productPhotos.length <= 1) return;
    const photos = product.productPhotos;
    const currentIndex = photos.findIndex(p => p.url === mainImage);
    const newIndex = currentIndex <= 0 ? photos.length - 1 : currentIndex - 1;
    setMainImage(photos[newIndex].url);
  };

  const handleNextImage = () => {
    if (!product?.productPhotos || product.productPhotos.length <= 1) return;
    const photos = product.productPhotos;
    const currentIndex = photos.findIndex(p => p.url === mainImage);
    const newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    setMainImage(photos[newIndex].url);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-xl font-bold uppercase">Product not found.</p></div>;
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
    <div className="w-full bg-background min-h-screen pt-10 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Image gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="aspect-[4/5] w-full bg-surface-container relative border-2 border-primary bg-surface-container-lowest flex items-center justify-center overflow-hidden group">
              {mainImage ? (
                <>
                  <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                  {photos.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-surface border-2 border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[calc(50%+2px)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all md:opacity-0 md:group-hover:opacity-100 font-black text-xl z-10"
                        aria-label="Previous image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M15 18l-6-6 6-6"/></svg>
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-surface border-2 border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[calc(50%+2px)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all md:opacity-0 md:group-hover:opacity-100 font-black text-xl z-10"
                        aria-label="Next image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="text-text-muted font-bold text-xl tracking-widest uppercase">NO IMAGE</div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    className={`aspect-square border-2 transition-all ${mainImage === photo.url ? 'border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'border-border hover:border-primary'} bg-surface-container-lowest overflow-hidden`}
                    onClick={() => setMainImage(photo.url)}
                  >
                    <img src={photo.url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="w-full lg:w-1/2 flex flex-col py-6">
            <p className="font-bold text-sm tracking-widest text-text-muted uppercase mb-2">
              {product.category?.name} • {product.gender}
            </p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">{product.name}</h1>

            {selectedVariant && (
              <p className="text-3xl font-black mb-8 border-b-2 border-primary pb-6">
                Rp {selectedVariant.price?.toLocaleString('id-ID')}
              </p>
            )}

            <div 
              className="text-lg leading-relaxed mb-10 text-on-surface-variant break-words max-w-full overflow-hidden [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-black [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&_a]:text-primary [&_a]:underline [&_a]:break-all"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Color selector */}
            {colors.length > 0 && (
              <div className="mb-8">
                <h3 className="font-black text-lg uppercase tracking-widest mb-4">COLOR</h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      className={`px-6 py-3 font-bold text-sm tracking-wider uppercase border-2 transition-all ${selectedColor?.id === color.id ? 'border-primary bg-primary text-on-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'border-border bg-surface-container-lowest hover:border-primary text-on-surface'}`}
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
              <div className="mb-10">
                <h3 className="font-black text-lg uppercase tracking-widest mb-4">SIZE</h3>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      className={`min-w-[48px] px-4 py-3 font-bold text-sm tracking-wider uppercase border-2 transition-all ${selectedSize?.id === size.id ? 'border-primary bg-primary text-on-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'border-border bg-surface-container-lowest hover:border-primary text-on-surface'}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedVariant && (
              <p className="font-bold text-sm tracking-wider uppercase mb-6 flex items-center gap-2">
                STATUS: 
                {selectedVariant.stock > 0
                  ? <span className="text-green-700">{selectedVariant.stock} IN STOCK</span>
                  : <span className="text-error">OUT OF STOCK</span>}
              </p>
            )}

            {message && (
              <div className={`p-4 font-bold text-sm tracking-wider uppercase border-2 mb-6 ${message.includes('Added') ? 'border-green-700 bg-green-50 text-green-700' : 'border-error bg-error/10 text-error'}`}>
                {message}
              </div>
            )}

            <button
              className="btn btn-primary w-full py-5 text-xl tracking-widest mt-auto border-2 border-primary hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              disabled={!selectedVariant || selectedVariant.stock === 0 || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? <span className="w-6 h-6 border-4 border-on-primary border-t-transparent rounded-full animate-spin inline-block"></span> : 'ADD TO CART'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
