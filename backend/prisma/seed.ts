/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
	datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
	console.log("🌱 Starting database seeding...");

	// Seed Admin
	const username = "admin";
	const existingAdmin = await prisma.admin.findUnique({
		where: { username },
	});

	if (!existingAdmin) {
		const hashedPassword = await bcrypt.hash("password", 10);
		const admin = await prisma.admin.create({
			data: {
				username,
				password: hashedPassword,
			},
		});
		console.log(`✅ Admin created: ${admin.username}`);
	} else {
		console.log(`ℹ️  Admin already exists: ${existingAdmin.username}`);
	}

	// Seed categories
	const categories = [
		{ name: "KING", order: 1 },
		{ name: "QUEEN", order: 2 },
		{ name: "PRINCE", order: 3 },
		{ name: "PRINCESS", order: 4 },
		{ name: "THE WHOLE KING", order: 5 },
		{ name: "THE WHOLE QUEEN", order: 6 },
		{ name: "BEST SINGER", order: 7 },
		{ name: "BEST PERFORMANCE", order: 8 },
	];

	for (const category of categories) {
		const existing = await prisma.category.findFirst({
			where: { name: category.name },
		});

		if (!existing) {
			await prisma.category.create({ data: category });
			console.log(`✅ Category created: ${category.name}`);
		} else {
			console.log(`ℹ️  Category already exists: ${category.name}`);
		}
	}

	console.log("🎉 Seeding completed!");
}

main()
	.catch((e) => {
		console.error("❌ Seeding failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

