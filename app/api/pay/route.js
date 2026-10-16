import crypto from 'crypto';

function generateSign(params, secretKey) {
  const filteredParams = Object.keys(params)
    .filter((key) => params[key] !== '' && params[key] !== null && key !== 'sign')
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  const queryString = Object.keys(filteredParams)
    .map((key) => key + '=' + filteredParams[key])
    .join('&');

  const stringSignTemp = queryString + '&key=' + secretKey;
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toLowerCase();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const amount = body.amount;
    const name = body.name;

    const merchant_id = process.env.WATCH_MERCHANT_ID;
    const secret_key = process.env.WATCH_API_KEY;

    if (!merchant_id || !secret_key) {
      return Response.json({ message: 'Environment variables are missing on Vercel' }, { status: 400 });
    }

    const payload = {
      merchant_id: merchant_id,
      order_id: 'ORD_' + Date.now(),
      amount: parseFloat(amount).toFixed(2),
      redirect_url: 'https://iphoneclubspayments.vercel.app/success',
      customer_name: name || 'Customer',
    };

    payload.sign = generateSign(payload, secret_key);

    const response = await fetch('https://watchpayss.com/api/payin/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.code === 0 && result.data && result.data.payment_url) {
      return Response.json({ paymentUrl: result.data.payment_url });
    } else {
      return Response.json({ message: result.msg || 'Payment gateway returned an error' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
}