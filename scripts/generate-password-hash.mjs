import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error(
    'Gunakan: npm run generate:password-hash -- "password-minimal-10-karakter"',
  );
  process.exit(1);
}
console.log(await bcrypt.hash(password, 12));
