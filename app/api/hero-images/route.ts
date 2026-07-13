import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Explicitly select exactly 3 high-quality and optimized images for the carousel background
    const images = [
      "/lor-de-formation.jpeg",
      "/img/Formation.jpeg",
      "/img/Formaions%202.jpeg"
    ];
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error returning hero images:", error);
    return NextResponse.json([
      "/lor-de-formation.jpeg",
      "/books-wood.jpg",
      "/apropos.jpeg"
    ]);
  }
}
