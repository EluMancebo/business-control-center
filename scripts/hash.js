import bcrypt from "bcryptjs";

async function run() {
  const password = "Admin123!";
  const hash = await bcrypt.hash(password, 10);
  console.log("HASH:", hash);
}

run();

