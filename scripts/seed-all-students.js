/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const env = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rosterPath = path.join(__dirname, "../src/data/students-roster.json");
const students = JSON.parse(fs.readFileSync(rosterPath, "utf8"));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log(`Starting bulk provisioning for ${students.length} students...`);
  console.log("Default password for all accounts: Ees@nitjsr2026\n");

  // Fetch all existing users from Supabase Auth to avoid redundant create calls
  let allExistingUsers = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) {
      console.error("Error listing users:", error);
      break;
    }
    if (!data.users || data.users.length === 0) break;
    allExistingUsers.push(...data.users);
    if (data.users.length < 100) break;
    page++;
  }

  const existingMap = new Map();
  for (const u of allExistingUsers) {
    if (u.email) {
      existingMap.set(u.email.toLowerCase(), u);
    }
  }
  console.log(`Found ${existingMap.size} existing Supabase auth accounts.`);

  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const email = student.email.toLowerCase().trim();
    const progress = `[${i + 1}/${students.length}]`;

    try {
      let userId;
      let existingUser = existingMap.get(email);

      if (existingUser) {
        userId = existingUser.id;
        // Update password & metadata to ensure unified password
        await supabase.auth.admin.updateUserById(userId, {
          password: "Ees@nitjsr2026",
          user_metadata: { full_name: student.name },
        });
        updatedCount++;
      } else {
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email: email,
          password: "Ees@nitjsr2026",
          email_confirm: true,
          user_metadata: { full_name: student.name },
        });

        if (createErr) {
          console.error(`${progress} ❌ Error creating ${email}:`, createErr.message);
          errorCount++;
          continue;
        }

        userId = newUser.user.id;
        existingMap.set(email, newUser.user);
        createdCount++;
      }

      // Ensure profile is up to date with roster details
      const profileUpdates = {
        id: userId,
        email: email,
        full_name: student.name,
        reg_no: student.reg_no,
        batch: student.batch,
        branch: "EE",
        programme: "UG",
        is_nitjsr: true,
      };

      if (student.phone && student.phone.length >= 10) {
        profileUpdates.phone = student.phone.trim();
      }

      const { error: profErr } = await supabase.from("profiles").upsert(profileUpdates);
      if (profErr) {
        console.warn(`${progress} ⚠️ Profile upsert warning for ${email}:`, profErr.message);
      }

      // Ensure P-ID is generated
      await supabase.rpc("ensure_pid_for", { uid: userId });

      // If Batch 2024, ensure membership is active
      if (student.batch === 2024) {
        await supabase.rpc("sync_membership_for", { uid: userId });
      }

      if ((i + 1) % 25 === 0 || i === students.length - 1) {
        console.log(`${progress} Processed ${student.reg_no} (${student.name})`);
      }

      // Small throttling delay to avoid any rate limiting
      await sleep(100);
    } catch (err) {
      console.error(`${progress} ❌ Unexpected exception for ${email}:`, err.message);
      errorCount++;
    }
  }

  console.log("\n================ Provisioning Complete ================");
  console.log(`Total students: ${students.length}`);
  console.log(`Newly created accounts: ${createdCount}`);
  console.log(`Existing accounts updated: ${updatedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
