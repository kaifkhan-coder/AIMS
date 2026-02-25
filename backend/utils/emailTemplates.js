export const otpEmailTemplate = (otp, email) => `
<div style="font-family: Arial; padding: 20px">
  <h2 style="color:#2563eb">Verify Your Staff Account</h2>

  <p>Your One-Time Password (OTP) is:</p>

  <div style="
    font-size: 24px;
    font-weight: bold;
    background: #f1f5f9;
    padding: 12px;
    display: inline-block;
    letter-spacing: 4px;
  ">
    ${otp}
  </div>

  <p>This OTP will expire in <strong>10 minutes</strong>.</p>

  <p>
    Or click here to verify:
    <br />
    <a href="http://10.40.251.45:5173/verify-otp?email=${email}"
       style="color:#2563eb;font-weight:bold;">
       Verify Account
    </a>
  </p>

  <hr />
  <small>AIMS Security Team</small>
</div>
`;
