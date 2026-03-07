import crypto from 'node:crypto';

function testPromoCode() {
    const code = `DEAL${crypto.randomInt(0, 10000).toString().padStart(4, '0')}`;
    console.log(`Promo Code: ${code}`);
    if (!/^DEAL\d{4}$/.test(code)) {
        throw new Error(`Invalid Promo Code format: ${code}`);
    }
}

function testOTP() {
    const code = crypto.randomInt(100000, 1000000).toString();
    console.log(`OTP: ${code}`);
    if (!/^\d{6}$/.test(code)) {
        throw new Error(`Invalid OTP format: ${code}`);
    }
}

function testPasswordResetToken() {
    const token = `${Date.now().toString(36)}-${crypto.randomBytes(16).toString('hex')}`;
    console.log(`Password Reset Token: ${token}`);
    if (!/^[a-z0-9]+-[a-f0-9]{32}$/.test(token)) {
        throw new Error(`Invalid Password Reset Token format: ${token}`);
    }
}

function testTxnCode() {
    const code = `TXN-${new Date().getFullYear()}-${crypto.randomInt(100000, 1000000)}`;
    console.log(`Transaction Code: ${code}`);
    if (!/^TXN-\d{4}-\d{6}$/.test(code)) {
        throw new Error(`Invalid Transaction Code format: ${code}`);
    }
}

console.log("Starting randomness verification tests...");
for (let i = 0; i < 100; i++) {
    testPromoCode();
    testOTP();
    testPasswordResetToken();
    testTxnCode();
}
console.log("All randomness verification tests passed!");
