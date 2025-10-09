#!/usr/bin/env node

/**
 * 🔐 Générateur de clés JWT sécurisées pour la production
 * Usage: node scripts/generate-secrets.js
 */

import crypto from 'crypto';

console.log('\n🔐 GÉNÉRATEUR DE CLÉS JWT POUR LA PRODUCTION\n');
console.log('=' .repeat(50));

// Générer des clés de 256 bits sécurisées
const jwtSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');

console.log('\n📋 VARIABLES D\'ENVIRONNEMENT POUR RENDER :');
console.log('-' .repeat(50));
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log(`NODE_ENV=production`);
console.log(`PORT=3000`);

console.log('\n⚠️  IMPORTANT :');
console.log('• Copiez ces valeurs dans Render (Variables d\'environnement)');
console.log('• Ne commitez JAMAIS ces clés dans Git');
console.log('• Gardez ces clés secrètes et sécurisées');
console.log('• Ces clés sont différentes de celles en développement\n');