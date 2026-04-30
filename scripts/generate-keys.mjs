#!/usr/bin/env node
// Generate fresh secrets for .env.local
import { randomBytes } from "node:crypto";

const k = () => randomBytes(32).toString("base64");

console.log(`AUTH_SECRET=${k()}`);
console.log(`NEXTAUTH_SECRET=${k()}`);
console.log(`PHI_ENCRYPTION_KEY=${k()}`);
console.log(`PRESCRIPTION_HMAC_KEY=${k()}`);
