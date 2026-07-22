import { hashMasterKey } from "../server/admin-auth";

const masterKey = process.argv[2];

if (!masterKey || masterKey.length < 8) {
  console.error('Usage: pnpm admin:hash-key "your-master-key"');
  process.exitCode = 1;
} else {
  console.log(await hashMasterKey(masterKey));
}
