import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {    toast } from 'react-toastify';

function ProductDetailsHead({ activeTab, setActiveTab, price  }) {
  const { id } = useParams();
  const styles = {
    container: {
      fontSize: 14,
      fontFamily: "Poppins, sans-serif",
      textAlign: "center",
      margin: "8px auto",
       
      
    },
    activeTab: { color: "#000", borderBottom: "2px solid #0156FF", cursor: "pointer" },
    tab: { borderBottom: "2px solid transparent", cursor: "pointer" },
    price: { fontSize: 14, color: "#000", fontWeight: 400 },
    priceBold: { fontWeight: 600 },
    quantityInput: {
      width: 50,
      height: 30,
      textAlign: "center",
      border: "1px solid #ddd",
      borderRadius: 5,
    },
  };

  const tabs = ["about", "details", "specs"];
  // State cho số lượng sản phẩm, mặc định là 1
  const [quantity, setQuantity] = useState(1);

  // State lưu thông tin tồn kho của sản phẩm (được lấy từ API)
  const [inventoryInfo, setInventoryInfo] = useState(null);
  // Fetch thông tin tồn kho khi component mount hoặc id thay đổi
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_APP_INVENTORY_API}/${id}`);
        setInventoryInfo(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin tồn kho", error);
      }
    };
    if (id) fetchInventory();
  }, [id]);

   
  
  // UserId giả dùng cho demo
  // const fakeUserId = "user9999";
  const fakeUserId = "64e65e8d3d5e2b0c8a3e9f12"
  // Định nghĩa API URL add to cart với URL params
  const CART_API_URL = `${import.meta.env.VITE_APP_CART_API}/add`;

  // Xử lý thêm sản phẩm vào giỏ hàng qua API
  const handleAddToCart = async () => {
    console.log("Thêm vào giỏ hàng với ID:", id);
    
    if (!id) {
      alert("Product ID is not defined!");
      return;
    }
    try {
      const res = await axios.post(`${CART_API_URL}/${fakeUserId}/${id}/1`);
      // console.log("Thêm vào giỏ hàng thành công", res.data);
      
      toast.success("🛒Thêm vào giỏ hàng thành công");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng", error.response?.data || error.message);
    }
  };


  // Tính giá sau discount
  const finalPrice = price;
  // Xác định trạng thái vô hiệu hóa nút: nếu chưa có thông tin tồn kho hoặc out of stock
  const isOutOfStock = !inventoryInfo || !inventoryInfo.inStock || inventoryInfo.stockInInventory <= 0;
  return (
    <div className="container" style={styles.container}>
      <div className="bg-white d-flex flex-column align-items-center justify-content-center p-4">
        <div className="d-flex flex-wrap justify-content-between w-100" style={{ maxWidth: "73%" }}>
          <div className="d-flex justify-content-center gap-3 text-secondary fw-semibold cursor-pointer">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={
                  activeTab === tab
                    ? "text-dark d-flex flex-column justify-content-center"
                    : "d-flex flex-column justify-content-center"
                }
                style={activeTab === tab ? styles.activeTab : styles.tab}
                onClick={() => setActiveTab(tab)}
              >
                <div>{tab.charAt(0).toUpperCase() + tab.slice(1)}</div>
              </div>
            ))}
          </div>
          <div className="d-flex align-items-center gap-3 py-2">
            <span style={styles.price}>
              On Sale from <span style={styles.priceBold}>${finalPrice}</span>
            </span>
            {/* <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              className="form-control text-center"
              style={styles.quantityInput}
            /> */}

            {/* THÔNG BÁO SỐ LƯỢNG THẤP */}
            {inventoryInfo?.stockInInventory > 0 && inventoryInfo.stockInInventory < 10 && (
              <div className="text-danger fw-bold small">
                ⚠️ Chỉ còn {inventoryInfo.stockInInventory} sản phẩm!
              </div>
            )}
            <button
              className="btn btn-primary rounded-pill px-4"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                opacity: isOutOfStock ? 0.5 : 1,
                pointerEvents: isOutOfStock ? "none" : "auto",
                fontSize: 14, 
                padding: "8px 0px",
                margin: "0 10px",
              }}
              title={isOutOfStock ? "Sản phẩm đã hết hàng" : ""}
            >
              Add to Cart
            </button>


            <button
              className="btn btn-warning rounded-pill d-flex align-items-center justify-content-center"
              style={{ width: 80, height: 40 }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width="50" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

 

export default ProductDetailsHead;
