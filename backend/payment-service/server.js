const { default: axios, post } = require('axios');
const { assert } = require('console');
const express = require('express');
const { url } = require('inspector');
const crypto = require('crypto');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
var accessKey = 'F8BBA842ECF85';
var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
app.post('/payment', async (req, res) => {
  //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
  //parameters
  const { amount, orderInfo, orderId, requestId, extraData } = req.body;

  var partnerCode = 'MOMO';
  var redirectUrl = 'http://localhost:2000/home';
  var ipnUrl = 'https://6002-116-110-41-130.ngrok-free.app/callback';
  var requestType = "payWithMethod";
  var autoCapture = true;
  var lang = 'vi';

  //before sign HMAC SHA256 with format
  //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
  var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + orderId + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
  //puts raw signature
  console.log("--------------------RAW SIGNATURE----------------")
  // console.log(rawSignature)
  //signature
  const crypto = require('crypto');
  var signature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
  console.log("--------------------SIGNATURE----------------")
  // console.log(signature)

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: orderId, // Store orderId in extraData to use in callback
    orderGroupId: '',
    signature: signature
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody),
    },
    url: 'https://test-payment.momo.vn/v2/gateway/api/create',
    data: requestBody,
  }

  let result;

  try {
    result = await axios(options);
    return res.status(200).json(result.data);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/callback', async (req, res) => {
  console.log('💫 Callback received from MoMo:', req.body);

  // Extract data from MoMo's request
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature
  } = req.body;

  // Verify signature from MoMo
  const rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&message=" + message + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&orderType=" + orderType + "&partnerCode=" + partnerCode + "&payType=" + payType + "&requestId=" + requestId + "&responseTime=" + responseTime + "&resultCode=" + resultCode + "&transId=" + transId;
  
  const checkSignature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  console.log('🔐 Verifying MoMo signature...');
  console.log('Expected:', signature);
  console.log('Calculated:', checkSignature);

  if (signature !== checkSignature) {
    console.error('❌ Invalid signature from MoMo');
    return res.status(400).json({ message: 'Invalid signature' });
  }

  // Check if payment was successful (resultCode = 0 means success in MoMo)
  console.log('📊 Payment result code:', resultCode);
  if (resultCode === 0) {
    try {
      // Prepare update data
      const updateData = JSON.stringify({
        'payment.status': 'paid',
        'status': 'confirmed'
      });
      
      console.log('🔄 Updating order status for order:', extraData);
      console.log('Update data:', updateData);

      // Call order-service through API Gateway to update order status
      const updateOrderResponse = await axios.put(
        `http://localhost:3000/api/orders/update/${extraData}/${encodeURIComponent(updateData)}`
      );

      console.log('✅ Order status updated successfully:', updateOrderResponse.data);
      return res.status(200).json({ message: 'Payment successful and order updated' });
    } catch (error) {
      console.error('❌ Error updating order status:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Failed to update order status' });
    }
  } else {
    console.log('❌ Payment failed with result code:', resultCode);
    try {
      // Update order status to failed
      const updateData = JSON.stringify({
        'payment.status': 'failed',
        'status': 'pending'
      });
      
      await axios.put(
        `http://localhost:3000/api/orders/update/${extraData}/${encodeURIComponent(updateData)}`
      );
      
      console.log('✅ Order status updated to failed');
    } catch (error) {
      console.error('❌ Error updating order status to failed:', error.response?.data || error.message);
    }
  }

  return res.status(200).json({ message: 'Callback processed' });
})

app.post("/transaction-status", async (req, res) => {
  const { orderId } = req.body;

  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = JSON.stringify({
    partnerCode: 'MOMO',
    requestId: orderId,
    orderId: orderId,
    signature: signature,
    lang: 'vi',
  });
  // options for axios
  const options = {
    method: 'POST',
    url: 'https://test-payment.momo.vn/v2/gateway/api/query',
    headers: {
      'Content-Type': 'application/json',
    },
    data: requestBody,
  };

  const result = await axios(options);

  return res.status(200).json(result.data);
})
app.listen(4545, () => {
  console.log('Server is running on port 4545');
})